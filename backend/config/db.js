"use strict";

// Configuracion de la DB
module.exports = {
    // Usar nombre de base de datos en minúsculas para evitar confusión en MongoDB Compass
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/inventario"
}