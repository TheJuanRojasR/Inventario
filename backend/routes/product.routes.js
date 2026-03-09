"use strict";

/**
 * RUTAS DE PRODUCTO
 * Define los endpoints CRUD para la gestion de produtos
 * Endpoints:
 * POST /api/products : crea un nuevo producto
 * GET /api/products : obtiene todos los productos
 * GET /api/products/:id : obtiene un producto por id
 * PUT /api/products/:id : actualiza un producto por id
 * DELETE /api/products/:id : elimina.desactiva un producto por id.
 */

const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller.js");
const { verifyToken } = require("../middleware/authJwt.js");

const { check } = require("express-validator");
const { checkRole } = require("../middleware/role.js");

// RUTAS CRUD

const validateProduct = [
    check("name")
        .not().isEmpty()
        .withmessage("El nombre es obligatorio"),

    check("description")
        .not().isEmpty()
        .withmessage("La descripcion es obligatoria"),

    check("price")
        .not().isEmpty()
        .withmessage("El precio es obligatoriao"),

    check("stock")
        .not().isEmpty()
        .withmessage("El Stock es obligatorio"),

    check("category")
        .not().isEmpty()
        .withmessage("La cateogia es obligatoria"),
    
    check("subcategory")
        .not().isEmpty()
        .withmessage("La subcategoria es obligatoria"),
];

router.post("/",
    verifyToken,
    checkRole(["admin", "coordinador"]),
    validateProduct,
    productController.createProduct,
);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.put("/:id",
    verifyToken,
    checkRole(["admin", "coordinador"]),
    validateProduct,
    productController.updateProduct,
);

router.delete("/:id",
    verifyToken,
    checkRole("admin"),
    productController.deleteProduct,
);

module.exports = router;