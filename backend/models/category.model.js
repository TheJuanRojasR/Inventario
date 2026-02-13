"use strict";

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre es requerido."],
            // unique: true, // Crea automaticamente un indice con nombre por defecto "name_1"
            trim: true,
            maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
        },
        description: {
            type: String,
            required: [true, "La descripción es requerida."],
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Creando Índice único de forma explicita
// Índice único correctamente definido - Utilizar cuando los indices son compuestos con mas campos.
categorySchema.index(
    { name: 1 },
    { unique: true, name: "idx_category_unique_name" }, // Prefijo idx_ es estándar de industria
);

module.exports = mongoose.model("Category", categorySchema);