"use strict";

/**
 * MODULE DE CONEXION CON LA BASE DE DATOS MONGODB
 * 
 * Este archivo maneja la conexion de la DB a mongodb utilizando mongoose
 * Establece la conexion a la DB, configura las opciones de conexion
 * Maneja los errores de conexion
 * Exporta la funcion conectDB para usarla en server.js
 */

const mongoose = require("mongoose");
const { DB_URI } = process.env;
const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Ok MongoDB conectado");
    } catch (error) {
        console.error("X error de conexion a MongoDB", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;