"use strict";

/**
 * Controlador de subcategorias
 * maneja todas la operaciones (CRUD) relacionadas con subcategorias
 * Estructura: Una subcateogira depende de una categoria padre, una categoria puede tener varias subcategorias, una subactegoria puede tener varios productos relacionados.
 * Cuando una subcategoria se elimina los productos relacionados se desactivan.
 * Cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 */

const SubCategory = require("../models/subcategory.model.js");
const Category = require("../models/category.model.js");

/**
 * crate: crear una subcategoria
 * POST /api/subcategories
 * Auth Bearer token requerido
 * Roles_ admin y coordinador
 * body requerido
 * name : nombre de la categoria
 * description : descripcion de la subcategoria
 * category: ide de la categoria padre a la que pertenece
 * Retorna
 *  201: subcategoria creada en MongoDB
 *  400: validacion fallida o nombre duplicado
 *  404: categoria padre no existe
 *  500: Error en base de datos
 */

exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Validar que categoria padre exista
        const parentCategory = await Category.findById(category);

        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoria padre no existe",
            });
        }

        const newSubcategory = new SubCategory({
            name: name.trim(),
            description: description.trim(),
            category: category,
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: "Subcategoria creada exitosamente",
            data: newSubcategory,
        });

    } catch (error) {
        console.error("Error en createSubcategory:", error);

        if (error.message.includes("duplicate key") || error.message.includes("Ya existe")) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una subcategoria con ese nombre",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear subcategoria",
        });
    }
};

/**
 * GET consultar listado de subcategorias
 * GET /api/subcategories
 * por defecto retorna solo las subcategorias activas
 * con includeInactive = true retorna todas las subcategorias incluyendo las inactivas
 * Ordena por descendente por fecha de creacion
 * retorna:
 *  200: lista de subcategorias
 *  500: error de base de datos
 */

exports.getSubcategories = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === "true";
    
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };
    
        const subcategories = await SubCategory.find(activeFilter).populate("category", "name");
    
        res.status(200).json({
            success: true,
            data: subcategories,
        });

    } catch (error) {
        console.error("Error en getSubcategories", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener subcategorias",
        });
    }
};

/**
 * Read Obtener uns subcategoria especifica por id
 * GET /api/subcategories/:id
 */

exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id).populate("category", "name");

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategoria no encontrada",
            })
        }
    
        res.status(200).json({
            success: true,
            data: subcategory,
        });

    } catch (error) {
        console.error("Error en getSubcategoryById", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener subcategoria",
        });
    }
};

/**
 * UPDATE subcategoria existente
 * PUT /api/subcategories/:id
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * Body:
 * name: Nuevo nombre
 * description: Nueva descripcion
 * validaciones
 * si se cambia la categoria verifica que exista
 * si quiere solo actualiza el nombre solo la descripcion o lo dos
 * Return:
 * 200 : Subcategoria actualizada
 * 404 : Subcategoria no encontrada
 * 500 : Error en base de datos
 */

exports.updateSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        
        // Verificar si cambia la categoria padre

        if (category) {
            const parentCategory = await Category.findById(category);

            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: "La categoria no existe",
                });
            }
        }

        // Construir objeto de actualizacion solo con campos enviados
        const updatedSubcategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { 
                name: name ? name.trim() : undefined,
                description: description ? description.trim() : undefined,
                category
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategoria no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            message: "Categoria actualizada exitosamente:",
            data: updatedSubcategory,
        });

    } catch (error) {
        console.error("Error en updateSubcategory", error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar subcategoria",
        });
    }
};

/**
 * Delete eliminar o desactivar una subcategoria
 * DELETE /api/subcategories/:id
 * Auth Bearer token requerido
 * roles: admin
 * query param:
 * hardDelete = true Elimina permanentemente de la base de datos
 * Default: Soft delete (Solo desactiva)
 * SOFT Delete: marca la subcategoria como inactiva. Desactiva en cascada todas las subcategorias, productos relacionados. Al activar retorna todos los datos incluyendo los inactivos.
 * HARD Delete: elimina permanentemente la subcategoria de la base de datos. Elimina en cascada la subcategoria y productos relacionados.
 * NOTA: NO SE PUEDEN RECUPERAR
 * Return:
 * 200 : Subcategoria eliminada o desactivada
 * 404 : Subcategoria no encontrada
 * 500 : Error de la base de datos
 */

exports.deleteSubcategory = async (req, res) => {
    try {
        const Product = require("../models/product.model.js");
        const isHardDelete = req.query.hardDelete === "true";

        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategoria no encontrada",
            });
        }

        if (isHardDelete) {
            // Elimina en cascada subcategoria y productos relacionados
            // Paso 1 : obtener IDs de todas los productos relacionados
            await Product.deleteMany({
                subcategory: req.params.id,
            })
            // Paso 2: Elimina la subcategoria
            await SubCategory.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: "Subcategoria eliminada permanente y productos relacionados",
                data: {
                    subcategory: subcategory,
                }
            });
        } else {
            subcategory.active = false;
            await subcategory.save();

            // Desactiva todos los productos relacionadaos
            const products = await Product.updateMany(
                { subcategory: req.params.id },
                { active: false }
            );

            return res.status(200).json({
                success: true,
                message: "Subcategoria desactivada exitosamente y sus productos asociados",
                data: {
                    subcategory: subcategory,
                    productsDeactivated: products.modifiedCount,
                }
            });
        }
        
    } catch (error) {
        console.error("Error en deleteSubcategory", error);
        res.status(500).json({
            success: false,
            message: "Error al desactivar la subcategoria",
            error: error.message,
        })
    }
}