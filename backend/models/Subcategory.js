"use strict";

const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es requerido."],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, "La descripción es requerida."],
        trim: true,
    },
    // Apunta hacia la coleccion Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "La categoría es requerida"],
        index: true, // Tip de Arquitecto: Indexar llaves foráneas para rapidez
    },
    active: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true,
    versionKey: false,
});

// Middleware post-save para manejo de errores de índice
subcategorySchema.post("save", function (error, doc, next) {
    // Código de error de duplicados : 11000
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Ya existe una subcategoría con ese nombre."));
    } else {
        next(error);
    }
});

module.exports = mongoose.model("Subcategory", subcategorySchema);