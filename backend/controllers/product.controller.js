"use strict";

// PENDIENTE : Middleware para validar la autorizacion de roles
// PENDIENTE : Middleware para validar si los IDs que ingresan son validos. Se llaman en routes.

// Crear Producto : Ver los campos necesarios en el modelo. (Tener cuidado con las relaciones categoria y subcategoria)

const { Category, Subcategory, Product } = require("../models/index.js");

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
    try{
        const {name, description, price, stock, category, subcategory} = req.body;
    
        // se valida que todos los campos requeridos esten presentes

        if(!name || !description || !price || !stock || !category || !subcategory){
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos',
                requiredFields: ['name', 'description', 'price', 'stock', 'category', 'subcategory']
            });
        };

        //Validar categoria padre existente
        const parentCategory = await Category.findById(category);
        if(!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'Categoria padre no existe',
                categoryId: category
            });
        };

        //Validar subcategoria padre existente
        const parentSubcategory = await Subcategory.findOne({
            _id: subcategory,
            category: category
        });
        if(!parentSubcategory){
            return res.status(404).json({
                success: false,
                message: 'Subcategoria padre no existe o no pertenece a la categoria especificada',
            })
        };

        //Verificacion de que la subcategoria pertenece a la categoria
        // if(parentSubcategory.category.toString() !== category){
        //     return res.status(400).json({
        //         success: false,
        //         message: "La subacategoria no pertence a la categoria"
        //     });
        // };

        //Nuevo producto
        const newProduct = new Product({
            name: name.trim(),
            description: description.trim(),
            price: price,
            stock: stock,
            category: category,
            subcategory: subcategory
        });

        //Registrar el usuario que crea el producto
        if (req.user && req.user._id){
            product.createdBy = req.user._id;
        }

        //Constante con el producto creado
        const savedProduct = await newProduct.save();

        //Consultar el producto poblado con los datos de relaciones
        const productWithDetails = await Product.findById(savedProduct._id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'username email');

        res.status(201).json({
            success: true,
            message: 'Producto creado correctamente',
            data: productWithDetails
        });

    } catch (error){
        console.error('Error en createProduct:', error)
        //manejo de error por indice unico
        if(error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'El nombre del producto ya existe'
            });
        }

        //Error de servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
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
        const includeInactive = req.query.includeInactive === "true";
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
            product.createdBy = undefined;
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
            error: error.message,
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
                    const subcategoryExist = await Subcategory.findOne({
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
            .populate("createdBy", "username email");

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