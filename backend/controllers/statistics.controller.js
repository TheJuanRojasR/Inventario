"use strict";

/**
 * CONTROLADOR DE ESTADISTICAS
 * 
 * GET /api/statistics
 * Auth Bearer token requerido
 * Estadisticas disponibles:
 * - Total de usuarios
 * - Total de productos
 * - Total de categorias
 * - Total de subcategorias
 */

const { User, Product, Category, Subcategory } = require("../models/index.js");

/**
 * Return
 * - 200 : OK estadisticas obtenidas
 * - 500 : Error de base de datos
 */

const getStatistics = async (req, res) => {
    try {
        // Ejecuta todas las queries en paralelo
        const [ totalUsers, totalProducts, totalCategories, totalSubcategories ] = await Promise.all([
            User.countDocuments(), // Contar usuarios
            Product.countDocuments(), // Contar productos
            Category.countDocuments(), // Contar categorias
            Subcategory.countDocuments(), // Contar subcategories
        ]);

        // Retornar estadisticas
        res.status(200).json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalSubcategories,
        });

    } catch (error) {
        console.error("Error en getStatistics: ", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estadisticas",
            error: error.message,
        });
    }
};

modules.exports = {
    getStatistics,
};