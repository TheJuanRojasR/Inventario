"use strict";

/**
 * Configuración de autenticación y seguridad.
 * Carga las variables de entorno desde el archivo .env ubicado en la raíz del proyecto.
 */
require("dotenv").config();

module.exports = {
    /**
     * Clave secreta utilizada para firmar y verificar los tokens JWT.
     * IMPORTANTE: En producción, debe definirse en la variable de entorno JWT_SECRET
     * con un valor seguro y único. El valor por defecto solo es para desarrollo.
     */
    secret: process.env.JWT_SECRET || "tuscretoparalostokens",

    /**
     * Tiempo de expiración del token de acceso JWT en segundos.
     * Valor por defecto: 86400 segundos = 24 horas.
     * Después de este tiempo, el usuario deberá autenticarse nuevamente.
     */
    jwtExpiration: process.env.JWT_EXPIRATION || 86400,

    /**
     * Tiempo de expiración del token de refresco en segundos.
     * Valor: 6048000 segundos = 70 días.
     * Permite al usuario obtener nuevos tokens de acceso sin volver a iniciar sesión.
     */
    jwtRefresh: 6048000,

    /**
     * Número de rondas de sal para el algoritmo bcrypt al hashear contraseñas.
     * Valor por defecto: 10 rondas.
     * Un valor más alto aumenta la seguridad pero también el tiempo de procesamiento.
     * Se recomienda un mínimo de 10 para entornos de producción.
     */
    saltRounds: process.env.SALT_ROUNDS || 10
}