"use strict";

/**
 * Archivo de configuracion central del backend
 * Este archivo centraliza todas las configuraciones principales de la aplicaciones
 * Configuracion de JWT tokens de autenticacion
 * Configuracion de conexion a MongoDB
 * Definicion de roles del sistema
 * 
 * Las variables de entorno tienen prioridad sobre los valores por defecto
 */

module.exports = {
    // Configuracion de JWT
    SECRET : process.env.JWT_SECRET || "tuscretoparalostokens",
    TOKEN_EXPIRATION : process.env.JWT_EXPIRATION || "24h",

    // Configuracion de DB
    DB : {
        URL : process.env.MONGODB_URI || "mongodb://localhost:27017/",
        OPTIONS : {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Roles del sistema
    ROLES : {
        ADMIN : "admin",
        COORDINADOR : "coordinador",
        AUXILIAR : "auxiliar"
    },
};