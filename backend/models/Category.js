"use strict";

// Modelo de categoria de MongoDB

const mongoose = require("mongoose");

// Campos de la tabla de categoria

const categoryShema = new mongoose.Shema({
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
    //  Se puede desactivar pero no borrar
    active: {
        type: Boolean,
        defalut: true,
    }
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

categoryShema.pre("save", async function (next) {
    try {
        // Obtener referencia de la coleccion de mongoDB
        // this : variable transitoria BUSCAR
        const collection = this.constructor.collection;

        // Obtener lista de todos los indeces
        const indexes = await collection.indexes();

        // Busca si existe un indce problematico con nombre "name_1"
        // (del orden: 1 significa ascendete)
        const problematicIndex = indexes.find(index => index.name === "name_1");

        // si lo encuentra, eliminarlo
        if (problematicIndex) {
            await collection.dropIndex("name_1")
        }
    } catch (err) {
        // Si el error es "Index no found" no es problema - continuar
        // Si es otro error pasarlo al siguiente middleware
        if (!err.message.includes("Index no fount")) {
            return next(err);
        }
    }
    next();
});

// Crear indice unico
// Mondo rechazara cualquier intento de insertar o actualizar un documento con un valor name que ya exista.

categoryShema.index({ name: 1}), {
    unique: true,
    name: "name_1", // Nombre explicito para evitar conflictos
}

module.exports = mongoose.model("Category", categoryShema);