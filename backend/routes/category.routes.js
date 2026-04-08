"use strict";

/**
 * RUTAS DE CATEGORIAS
 * Define los endpoints CRUD para la gestion de categorias
 * Las categorias son contenedores padres de subcategorias y productos
 * Endpoints:
 * POST /api/categories : crea una nueva categoria
 * GET /api/categories : obtiene todas las categorias
 * GET /api/categories/:id : obtiene una categoria por id
 * PUT /api/categories/:id : actualiza una categoria por id
 * DELETE /api/categories/:id : elimina.desactiva una categoria por id.
 */

const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller.js");
const { verifyToken } = require("../middleware/authJwt.js");
const { checkRole } = require("../middleware/role.js");

// RUTAS CRUD

router.post("/",
    verifyToken,
    checkRole(["admin", "coord", "aux"]),
    categoryController.createCategory,
);

router.get("/", categoryController.getCategories);

router.get("/:id", categoryController.getCategoryById);

router.put("/:id",
    verifyToken,
    checkRole(["admin", "coord"]),
    categoryController.updateCategory,
);

router.delete("/:id",
    verifyToken,
    checkRole("admin"),
    categoryController.deleteCategory,
);

module.exports = router;