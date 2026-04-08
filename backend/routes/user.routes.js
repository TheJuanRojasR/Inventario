"use strict";

/**
 * RUTAS DE USUARIOS
 * 
 * Define endpoints para gestion de usuarios en el sistema
 * POST /api/users
 * GET /api/users
 * GET /api/users/:id
 * PUT /api/users/:id
 * DELETE /api/users/:id
 */

const express = require("express");
const router =  express.Router();
const userController = require("../controllers/user.controller.js");
const { verifyToken } = require("../middleware/authJwt.js");
const { checkRole } = require("../middleware/role.js");

// Revision de problemas de autentificacion y autorizacion
router.use((req, res, next) => {
    console.log("\n=== DIAGNOSTIVO FR RUTA ===")
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log("Headers:", {
        "Authorization" : req.headers.authorization ? "***" + req.headers.authorization.slice(8) : null,
        "x-access-token" : req.headers["x-access-token"] ? "***" + req.headers["x-access-token"].slice(8) : null,
        "user-agent" : req.headers["user-agent"]
    });
    next();
});

// RUTAS CRUD

router.post("/",
    verifyToken,
    checkRole(["admin", "coord"]),
    userController.createUser,
);

router.get("/",
    verifyToken,
    userController.getAllUsers);

router.get("/:id", 
    verifyToken,
    userController.getUserById);

router.put("/:id",
    verifyToken,
    checkRole(["admin", "coord", "aux"]),
    userController.updateUser,
);

router.delete("/:id",
    verifyToken,
    checkRole("admin"),
    userController.deleteUser,
);

module.exports = router;

// Cuando se utiliza el validador y cuando no