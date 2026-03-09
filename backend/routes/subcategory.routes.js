"use strict";

/**
 * RUTAS DE SUBCATEGORIAS
 * Define los endpoints CRUD para la gestion de subcategorias
 * Endpoints:
 * POST /api/subcategories : crea una nueva subcategoria
 * GET /api/subcategories : obtiene todas las subcategorias
 * GET /api/subcategories/:id : obtiene una subcategoria por id
 * PUT /api/subcategories/:id : actualiza una subcategoria por id
 * DELETE /api/subcategories/:id : elimina.desactiva una subcategoria por id.
 */

const express = require("express");
const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller.js");
const { verifyToken } = require("../middleware/authJwt.js");

const { check } = require("express-validator");
const { checkRole } = require("../middleware/role.js");

// RUTAS CRUD

const validateSubcategory = [
    check("name")
        .not().isEmpty()
        .withmessage("El nombre es obligatorio"),

    check("description")
        .not().isEmpty()
        .withmessage("La descripcion es obligatoria"),

    check("category")
        .not().isEmpty()
        .withmessage("La categoria es obligatoria"),
];
    


router.post("/",
    verifyToken,
    checkRole(["admin", "coordinador"]),
    validateSubcategory,
    subcategoryController.createSubcategory,
);

router.get("/", subcategoryController.getSubcategories);

router.get("/:id", subcategoryController.getSubcategoryById);

router.put("/:id",
    verifyToken,
    checkRole(["admin", "coordinador"]),
    validateSubcategory,
    subcategoryController.updateSubcategory,
);

router.delete("/:id",
    verifyToken,
    checkRole("admin"),
    subcategoryController.deleteSubcategory,
);

module.exports = router;