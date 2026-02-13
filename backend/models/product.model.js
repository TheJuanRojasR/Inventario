"use strict";

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
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
        price: {
            type: Number,
            required: [true, "El precio es requerido."],
            min: [0, "El precio no puede ser negativo."]
        },
        stock: {
            type: Number,
            required: [true, "El stock es requerido."],
            min: [0, "El stock no puede ser negativo."]
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "La categoría es requerida"],
            index: true,
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
            required: [true, "La subcategoría es requerida"],
            index: true,
        },
        // Quien crea el producto
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        // Array de urls de imagenes de productos
        images: [{
            type: String,
        }],
        active: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


productSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        return next(new Error("Ya existe un producto con ese nombre."));
    }
    next(error);
});

module.exports = mongoose.model("Product", productSchema);