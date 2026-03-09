"use strict";

// PENDIENTE : Middleware para validar la autorizacion de roles
// PENDIENTE : Middleware para validar si los IDs que ingresan son validos. Se llaman en routes.

// Crear Producto : Ver los campos necesarios en el modelo. (Tener cuidado con las relaciones categoria y subcategoria)

const { Category, SubCategory, Product } = require("../models/index.js");

/**
 * @description Crea un nuevo producto en la base de datos.
 * @route POST /api/products
 * @access Privado (Admin, Coordinador)
 * * @body {String} name - Nombre único del producto.
 * @body {String} description - Detalle del producto.
 * @body {Number} price - Precio unitario (debe ser positivo).
 * @body {Number} stock - Cantidad disponible.
 * @body {String} categoryId - ID de MongoDB de la categoría padre.
 * @body {String} subcategoryId - ID de MongoDB de la subcategoría (debe pertenecer a categoryId).
 * @body {Array<String>} images - Lista de URLs de las imágenes.
 * @body {Boolean} [active=true] - (Opcional) Estado de visibilidad del producto.
 * * @returns {201} Producto creado exitosamente.
 * @returns {400} Error de validación, formato de ID inválido o nombre duplicado.
 * @returns {403} Error de permisos (Usuario con rol 'auxiliar').
 * @returns {404} La categoría o subcategoría no existen.
 * @returns {500} Error interno del servidor.
 */

exports.createProduct = async (req, res) => {
    try {
        // 1. Desestructurando
        const { name, description, price, stock, categoryId, subcategoryId, images, active  } = req.body;

        // 2. Obtener el id del usuario desde el token
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // 3. Valida la existencia de los IDs. Ejecutar las 2 funciones asincronas para ahorrar tiempo
        const [ existingCategory, existingSubcategory ] = await Promise.all([
            Category.findById(categoryId),
            // Verifica que si sea una subcategoria y que pertenezca a la categoria padre
            SubCategory.findOne({ _id: subcategoryId, category: categoryId }), 
        ]);
        
        if (!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "No existe la categoria enviada. Intente de nuevo",
            });
        }

        if (!existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: "No existe la subcategoria enviada. Intente de nuevo",
            });
        }

        // NOTA : Se deberia crear un middleware de autorizacion en routes
        if (!userRole || userRole === "auxiliar") {
            return res.status(403).json({
            success: false,
            message: "No tiene permiso para crear un producto"
    });
        }

        // 4. Creando un producto
        const newProduct = new Product({
            name: name?.trim(),
            description: description?.trim(),
            price,
            stock,
            category: existingCategory._id,
            subcategory: existingSubcategory._id,
            createdBy: userId,
            images,
            // Si active es null o undefined, usa true por defecto
            active: active ?? true, 
        });

        // 5. Guardando producto
        await newProduct.save();

        // 6. Creando DTO de respuesta
        const productResponse = {
            // Pasa de tipo ObjectId -> String
            id: newProduct._id.toString(),
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock,
            categoryId: newProduct.category,
            subcategoryId: newProduct.subcategory,
            active: newProduct.active,
            createdAt: newProduct.createdAt,
        }

        // 7. Responde con el DTO del producto creado
        res.status(201).json({
            success: true,
            message: "Producto creado exitosamente.",
            data: productResponse,
        });

    } catch (error) {
        // Error si esta duplicado el producto
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "El nombre del producto ya existe."
            });
        }

        // Error de formato de ID (CastError)
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "El formato del ID enviado no es válido."
            });
        }
        
        // Error general
        console.error("Error en createProduct", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * READ : Obtener productos (con filtro de activos/inactivos)
 * 
 * GET api/products
 * QUERY PARAMS:
 *  includeInactive=true : Mostrar tambien productos desactivados
 *  Default: Solo productos activos (active: true)
 * 
 * Retorna: Array de productos poblados con categoria y subcategoria
 */

exports.getProducts = async (req, res) => {
    try {
        // Determinar si incluir productos inactivos
        const { includeInactive } = req.query.includeInactive === "true";
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };


        // Obtener productos con datos relacionados
        const products = await Product.find(activeFilter)
            .populate("category", "name")
            .populate("subcategory", "name")
            .sort({ createdAt: -1 });
        
        // Si el usuario es auxiliar, no mostrar informacion de quien lo creo
        if (req.user && req.user.role === "auxiliar") {
            // Ocultar campo createdBy para usuarios auxiliares
            products.forEach(product => {
                product.createdBy = undefined;
            });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
        
    } catch (error) {
        console.error("Error en getProduct", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: error.message,
        });
    }
};

/**
 * READ : Obtener un producto especifico por Id
 * GET /api/products/:id
 * Retorna : Producto poblado con categoria y subcategoria
 */

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name description")
            .populate("subcategory", "name description");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
            });
        }

        // Ocultar createdBy para usuarios auxiliares
        if (req.user && req.user.role === "auxiliar") {
            // Ocultar campo createdBy para usuarios auxiliares
            products.forEach(product => {
                product.createdBy = undefined;
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });

    } catch (error) {
        console.error("Error en getProductById: ", error);

        res.status(500).json({
            success: false,
            message: "Error al obtener producto",
            error: error. message,
        })
    }
};

/**
 * UPDATE : Actualizar un producto
 * PUT /api/products/:id
 * Body : { cualquier campo a actualizar }
 * 
 *  - Solo actualiza campos enviados
 *  - Valida relaciones si se envian category o subcategory
 *  - Retorna producto actualizado
 */

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = {};
    
        // Agregar solo los campos que fueron enviados
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;
    
        // Calidar relaciones si se actualizan
        if (category || subcategory) {
            if (category) {
                const categoryExist = await Category.findById(category);
                if (!categoryExist) {
                    return res.status(404).json({
                        success: false,
                        message: "La categoria solicitada no existe",
                    })
                }

                if (subcategory) {
                    const subcategoryExist = await SubCategory.findOne({
                        _id: subcategory,
                        category: category || updateData.category,
                    });

                    if (!subcategoryExist) {
                        return res.status(404).json({
                            success: false,
                            message: "La subcategoria no existe o no pertenece a la categoria",
                        });
                    }
                }
            }
        }

        // Actualizar producto en DB
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).populate("category", "name")
            .populate("subcategory", "name")
            .populate("createBy", "username email");

        if (!updateProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Producto actualizado exitosamente",
            data: updateProduct,
        });
    } catch (error) {
        console.error("Error en updateProduct ", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar producto",
            error: error.message,
        });
    }
};

/**
 * DELETE : Elimminar o desactivar un producto
 * 
 * DELETE /api/products/:id
 * Query params:
 *  - hardDelete = true : Eliminar permanentemente de la DB
 *  - Default : soft delete (marcar como inactivo)
 * 
 * SOFT DELETE : Solomarca active: false
 * HARD DELETE : Elimina permanentemente el documento
 */

exports.deleteProduct = async (req, res) => {
    try {
        const isHardDelete = req.query.hardDelete === "true";
        const product = await Product.findById(req.params.id);
    
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
            });
        }
    
        if (isHardDelete) {
            // HARD DELETE : Eliminar permanentemente de la DB
            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Producto eliminado permanentemente de la base de datos",
                data: product,
            });
        } else {
            // SOFT DELETE : Solo marcar como inactivo
            product.active = false;
            await product.save();
    
            res.status(200).json({
                success: true,
                message: "Producto desactivado exitosamente (soft delete)",
                data: product,
            });
        }
    } catch (error) {
        console.error("Error en deleteProduct: ", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar producto",
            error: error.message,
        })
    }
};