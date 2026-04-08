"use strict";

const { Category } = require("../models");

/**
 * crate: crear una categoria
 * POST /api/categories
 * Auth Bearer token requerido
 * Roles_ admin y coordinador
 * body requerido
 * name : nombre de la categoria
 * description : descripcion de la categoria
 * Retorna
 *  201: categoria creada en MongoDB
 *  400: validacion fallida o nombre duplicado
 *  500: Error en base de datos
 */

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "El nombre es obligatorio",
            });
        }

        if (!description || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "La descripcion es obligatorio",
            });
        }

        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        const existingCategory = await Category.findOne({ name: trimmedName });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una categoria con ese nombre",
            })
        }

        const newCategory = new Category({
            name: trimmedName,
            description: trimmedDesc,
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Categoria creada exitosamente",
            data: newCategory,
        });

    } catch (error) {
        console.error("Error en createCategory:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una categoria con ese nombre",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear categoria",
            error: error.message,
        });
    }
};

/**
 * GET consultar listado de categorias
 * GET /api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive = true retorna todas las categorias incluyendo las inactivas
 * Ordena por descendente por fecha de creacion
 * retorna:
 *  200: lista de categorias
 *  500: error de base de datos
 */

exports.getCategories = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === "true";

        console.log(req.query.includeInactive);
    
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };
    
        const categories = await Category.find(activeFilter).sort({ createdAt: -1 });
    
        res.status(200).json({
            success: true,
            data: categories,
        });

    } catch (error) {
        console.error("Error en getCategories", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener categorias",
            error: error.message,
        });
    }
};


exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Categoria no encontrada",
            })
        }
    
        res.status(200).json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error("Error en getCategoryById", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener categoria",
            error: error.message,
        });
    }
};

/**
 * UPDATE categoria existente
 * PUT /api/categories/:id
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * Body:
 * Nuevo nombre
 * Nueva descripcion
 * Return:
 * 200 : Categoria actualizada
 * 400 : Nombre ya existente
 * 404 : Categoria no encontrada
 * 500 : Error en base de datos
 */

exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name.trim();

            const existing = await Category.findOne({
                name: updateData.name,
                _id: { $ne: req.params.id  }
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Este nombre de categoria ya existe.",
                });
            }
        }

        if (description) {
            updateData.description = description.trim();
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoria no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            message: "Categoria actualizada exitosamente:",
            data: updatedCategory,
        });

    } catch (error) {
        console.error("Error en updateCategory", error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar categoria",
            error: error.message,
        });
    }
};

/**
 * Delete eliminar o desactivar una categoria
 * DELETE /api/categories/:id
 * Auth Bearer token requerido
 * roles: admin
 * query param:
 * hardDelete = true Elimina permanentemente de la base de datos
 * Default: Soft delete (Solo desactiva la categoria)
 * SOFT Delete: marca la categoria como inactiva. Desactiva en cascada todas las subcategorias, productos relacionados. Al activar retorna todos los datos incluyendo los inactivos.
 * HARD Delete: elimina permanentemente la categoria de la base de datos. Elimina en cascada la categoria, subcategorias y productos relacionados.
 * NOTA: NO SE PUEDEN RECUPERAR
 * Return:
 * 200 : Categoria eliminada o desactivada
 * 404 : Categoria no encontrada
 * 500 : Error de la base de datos
 */

exports.deleteCategory = async (req, res) => {
    try {
        const { Subcategory, Product } = require("../models");
        const isHardDelete = req.query.hardDelete === "true";

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Categoria no encontrada",
            });
        }

        if (isHardDelete) {
            // lean() : Metodo que vuelve los documentos de Mongo en objetos JS. Mejorando la velocidad y reducinedo la memoria gastada. Como es un objeto js no tiene los metodos normales de mongoose (.save(), .populate(), etc). Es bueno cuando solo se necesita leer datos.
            let subIds = await Subcategory.find({ category: req.params.id }).lean();

            // Arreglo momentanio
            subIds = subIds.map(s => s._id)

            await Product.deleteMany({ category: req.params.id });

            await Product.deleteMany({ subcategory: { $in: subIds }});

            await Subcategory.deleteMany({ category: req.params.id });

            await Category.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: "Categoria eliminada permanente y sus subcategorias y productos relacionados",
                data: {
                    category: category,
                }
            });
        } else {
            category.active = false;
            await category.save();

            // Desactiva todas las subcategorias relacionadas
            const subcategories = await Subcategory.updateMany(
                { category: req.params.id },
                { active: false }
            );

            // Desactivar todos los productos relacionados por la categoria subcategoria
            const products = await Product.updateMany(
                { category: req.params.id },
                { active: false },
            );

            return res.status(200).json({
                success: true,
                message: "Categoria desactivada exitosamente y sus subcategorias y productos asociados",
                data: {
                    category: category,
                    subcategoriesDeactivated: subcategories.modifiedCount,
                    productsDeactivated: products.modifiedCount,
                }
            });
        }
        
    } catch (error) {
        console.error("Error en deleteCategory", error);
        res.status(500).json({
            success: false,
            message: "Error al desactivar la categoria",
            error: error.message,
        })
    }
}