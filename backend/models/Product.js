"use strict";

// Modelo de producto de MongoDB
// Define la estructura del producto
// El producto depende de subcategoria

const mongoose = require("mongoose");

// Campos de la tabla Producto

const productSchema = new mongoose.Shema({
    // Nombre Producto
    name: {
        type: String,
        require: [true, "El nombre es requerido."],
        unique: true,
        trim: true,
    },
    // Descripcion del producto
    description: {
        type: String,
        require: [true, "La descripcion es requerida."],
        trim: true,
    },
    // Precio del producto - No puede tener valores negativos
    price: {
        type: Number,
        require: [true, "La precio es requerido."],
        min: [0, "El precio no puede ser negativo."]
    },
    // Stock del producto
    stock: {
        type: Number,
        require: [true, "El stock es requerido."],
        min: [0, "El stock no puede ser negativo."]
    },
    // Categoria del producto
    // Un producto tiene una categoria
    category: {
        type: mongoose.Shema.Types.ObjectId,
        ref: "Category",
        required: [true, "La categoria es requerida"],
    },
    // Un producto tiene subcategoria
    subcategory: {
        type: mongoose.Shema.Types.ObjectId,
        ref: "Subcategory",
        required: [true, "La subcategoria es requerida"],
    },
    // Quien crea el producto
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Puede ser poblado para mostrar los usuarios
    },
    // Array de urls de imagenes de productos
    images: [{
        type: String,
    }],
    // Se puede desactivar pero no borrar el producto
    active: {
        type: Boolean,
        defalut: true,
    },
},
{
    timestamps: true,
    versionKey: false,
});

productSchema.post("save", function (error, doc, next) {
    // Verifica si es error de mongoDb por violacion de indice unico
    if (error.name === "MongoServerError" && error.code === 11000) {
        return next(new Error("Ya existe un producto con ese nombre."));
    }
    next(error);
});

module.exports = mongoose.model("Product", productSchema);