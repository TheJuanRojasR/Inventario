"use strict";

/**
 * MIDDLEWARE: Authentication JWT
 * 
 * Verifica que el usuario tenga un token valido y carga los datos del usuario en la req.user
 * 
 * [DEPRECATED] - Este middleware no se está utilizando actualmente.
 * Por favor utilizar 'authJwt.js' que es el implementado en las rutas.
 */

const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Autenticar Usuario
 * Valida el token Bearer en el header Authorization
 * Si es valido carga el usuario en req.user
 * Si no es valido o no existe retorna - 404 Unauthorized
 */

exports.authenticate = async (req, res, next) => {
    try {
        // Extraer el token del header Bearer <token>
        const token = req.header("Authorization")?.replace("Bearer ", "");
    
        // Si no hay token rechaza la solicitud
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token de autentificacion requerido",
                details: "Incluye Authorization Bearer <token>",
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario en DB
        const user = await User.findById(decoded.id);

        // Si no existe
        if (!user){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado o ha sido eliminado",
            });
        }

        // Cargar el usuario en el request para usar en los siguientes middlewares o controladores
        req.user = user;

        // LLamar el siguiente middleware o controlador
        next();
    } catch (error) {
        let message = "Token invalido o expirado";

        if (error.name === "TokenExpiredError") {
            message = "Token expirado, Por favor inicia sesion de nuevo nuevamente";
        } else if (error.name === "JsonWebTokenError") {
            message = "Token invalido o mal formado";
        }

        return res.status(401).json({
            success: false,
            message: message,
            error: error.message,
        });
    }
};

/**
 * Middleware para autorizar por rol
 * Verificar que el usuario tiene uno de los roles requeridos se usa despues del middleware de authenticate
 * @param { Array } roles - array de roles permitidos 
 * @return { Funciton } - Middleware function
 * 
 * uso : app.delete("/api/products/:id", authenticate, authorize([ "admin" ]))
 */

exports.authorize = (roles) => {
    return (req, res, next) => {
        // Verificar que el usuario autenticado tiene uno de los roles permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "No tiene autorizacion para esta accion",
                requiredRoles: roles,
                currentRole: req.user.role,
                details: `Tu rol es "${req.user.role}" pero se requiere uno de: ${roles.join(",")}`,
            })
        }

        // Si el usuario tiene permiso continuar
        next();
    };
};