"use strict";

// Modelo de subcategoria de MongoDB
// Subcategoria depende de categoria

const mongoose = require("mongoose");

// Campos de la tabla de categoria

const subcategoryShema = new mongoose.Shema({
    // Nombre categoria
    name: {
        type: String,
        require: [true, "El nombre es requerido."],
        unique: true,
        trim: true,
    },
    // Descripcion de la categoria
    description: {
        type: String,
        require: [true, "La descripcion es requerida."],
        trim: true,
    },
    // Categoria padre 
    category: {
        type: mongoose.Shema.Types.ObjectId,
        ref: "Category",
        required: [true, "La categoria es requerida"],
    },
    // Se puede desactivar pero no borrar  
    active: {
        type: Boolean,
        defalut: true,
    },
},
{
    timestamps: true,
    versionKey: false,
});

// Middleware pre save
// Limpia indices duplicados porque en ocaciones Mongo los crea.
// 1. Optiene una lista de todos los indices de la coleccion.
// 2. Busca si existe indice con nombre name_1 (antiguo o duplicado)
// 2.1 Si exite lo elimina antes de nuevas operaciones.
// 2.2 Si no ignora errores si el indice no existe.

subcategoryShema.post("save", function (error, doc, next) {
    // Verifica si es error de mongoDb por violacion de indice unico
    if (error.name === "MongoServerError" && error.code === 1000) {
        next(new Error("Ya existe una subcategoria con ese nombre."));
    } else {
        next(error);
    }
});

module.exports = mongoose.model("Subcategory", subcategoryShema);