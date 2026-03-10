"use strict";

/**
 * SERVIDOR PRINCIPAL
 * 
 * Punto de entrada a la aplicacion backend
 * Configuracion Express, cors, conecta MongoDB, define rutas y conecta con el frontend
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");

/**
 * Validaciones iniciales
 * Verifica que las variables de entorno requeridas esten definidas
 */

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
    console.log("Error: MONGODB_URI o MONGO_URI no esta definida en env");
    process.exit(1);
}

if (!process.env.JWT_SECRET){
    console.log("Error: JWT_SECRET no esta definida en env");
    process.exit(1);
}

// Importar todas la rutas
const { authRoutes, userRoutes, productRoutes, categoryRoutes, subCategoryRoutes, statisticRoutes } = require("./routes");

// Iniciar express
const app = express();

// Cors permite las solicitudes desde el frontend
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

// Morgan registra todas las solicitudes HTTP en consola
app.use(morgan("dev"));

// Express JSON parsea bodies en formato JSON
app.use(express.json());

// Express URL encoded soporta datos form-encoded
app.use(express.urlencoded({ extended: true }));

// Conexion a mongoDB
mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB conectado correctamente"))
    .catch(err => {
        console.error("Error de conexion a mongoDB:", err.message);
        process.exit(1);
    })

    // Registra Rutas

    // Rutas de autenticacion
    app.use("/api/auth", authRoutes);

    // Rutas de usuarios
    app.use("/api/users", userRoutes);

    // Ruta de productos
    app.use("/api/products", productRoutes);

    // Ruta de categorias
    app.use("/api/categories", categoryRoutes);

    // Rutas de subcategorias
    app.use("/api/subcategories", subCategoryRoutes);

    // Rutas de estadisticas
    app.use("/api/statistics", statisticRoutes);

    // Manejo de errores globales
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: "Ruta no encontrada",
        });
    });

    // Iniciar el servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

