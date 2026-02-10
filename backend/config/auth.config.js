"use strict";

// Carga las variables de entorno desde .env
require("dotenv").config();

module.exports = {
    // 
    secret: process.env.JWT_SECRET || "tuscretoparalostokens",
    // Tiempo de vida de un token
    jwtExpiration: process.env.JWT_EXPIRATION || 86400,
    // Tiempo de vida de un token de refresco
    jwtRefresh: 6048000,
    // Indica cuantas veces se procesa la contraseña para encriptarla.
    saltRounds: process.env.SALT_ROUNDS || 8
}