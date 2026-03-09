"use strict";

/**
 * MIDDLEWARE DE VERIFICACION JWT
 * Middleware para verificar y validar tokens JWT en las solicitudes
 * Se usa en todas la rutas protegidas para autenticar usuarios
 * Caracteristicas :
 * Soporta dos formatos de token
 * 1. Authorization : Bearer <token> (Estandar REST)
 * 2. x-access-token (header personalizado)
 * Extraer informacion del token (id role email)
 * La adjunta a req.userId, req.userRole, req.userEmail para el uso en los controladores
 * Manejo de errores con codigos 401/403 apropiados
 * Flujo :
 * 1. Lee el header Authorization o x-access-token
 * 2. Extrae el token (quita el Vearer si es necesario)
 * 3. Verifica el token con la JWT_SECRET
 * 4. Si es valido continua al siguiente middleware
 * 5. Si es invalido retorna error 401 Unauthorized
 * 6. Si falta, retorna 403 Forbidden
 * 
 * Validacion de token
 * 1. Verifica firma criptografica con JWT_SECRET
 * 2. Comprueba que no haya expirado
 * 3. Extrae payload { id, role, email }
 */

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

/**
 * Verificar token
 * Funcionalidad - Busca el token en las ubicaciones posibles (orden de procedencia)
 * 1. header Authorization con formato Bearer <token>
 * 2. header x-access-token
 * Si encuentra el token verifica su validez
 * Si no encuentra retorna 403 Forbidden
 * Si token es invalido/expiro retorna 401 Unauthorized
 * Si es valido adjunta datos del usuario a req y continua
 * 
 * Headers soportados : 
 * 1. Authorization bearer <asdfaaadfs...>
 * 2. x-access-token : <asdfasdf...> id, role, email
 * Propiedades del request despues del middleware :
 * req.userId = (string) Id del usuario MongoDB
 * req.userRole = (string) Rol del usuario (admin, coordinador, auxiliar)
 * req.userEmail = (string) Rmail de usuario
 */

const verifyTokenFn = (req, res, next) => {
    try {
        // Soporta dos formatos Authorization bearer o access-token
        let token = null;

        // Formato Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            // Extraer token quitando el Beader
            token = req.headers.authorization.substring(7);
        } 
        
        // Formato access-token
        else if (req.headers["x-access-token"]) {
            token = req.headers["x-access-token"];
        }

        // Si no encontro token rechaza la solicitud
        if (!token) {
            return res.status(403).json({
                success: false,
                message: "Token no proporcionado",
            });
        }

        // Verificar el token con la clave secreta
        const decoded = jwt.verify(token, config.secret);

        req.userId = decoded.id;
        req.userRol = decoded.role;
        req.userEmail = decoded.email;

        // Token en valido continuar con el siguiente middleware ruta
        next();
    } catch (error) {
        // Token invalido o expirado
        return res.status(401).json({
            success: false,
            message: "Token invalido o expirado",
            error: error.message,
        })
    }
};

/**
 * Validacion de funcion para mejor seguridad y manejo de errores
 * Verificar que verifyTokenFn sea una funcion valida
 * Estos es una vaidacion de seguridad para que el middleware se exporte correctamente
 * Si algo sale mal en su definicion lanzara un error en tiempo de carga del modulo
 */

if (typeof verifyTokenFn !== "function") {
    console.error("Error: verifyTokenFn no es una funcion valida");
    throw new Error("verifyTokenFn debe ser una funcion");
}

// exportar el middleware
module.exports = { verifyTokenFn };

