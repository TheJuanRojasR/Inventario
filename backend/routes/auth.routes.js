"use strict";

/**
 * RUTAS DE AUTENTICACION
 * 
 * Define los endpoints relativos a autentificacion de usuarios
 * 
 * POST /api/auth/signin : Registrar un nuevo usuario
 */

const express = require("express");
const router = express.Router();

const authController =require("../controllers/auth.controller.js");
const { verifySingnUp } = require("../middleware/verifySingUp.js");
const { verifyToken } = require("../middleware/authJwt.js")
const { checkRole } = require("../middleware/role.js");

// RUTAS AUTENTICACION

// Requiere email-usuario y password
router.post("/signin", authController.signin);

router.post("/signup",
    verifyToken,
    checkRole("admin"),
    verifySingnUp.checkDuplicateUsernameOrEmail,
    verifySingnUp.checkRolesExisted,
    authController.signup,
);

module.exports = router;