"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Schema : Crea una plantilla para que todos los usuarios (documentos) tengan la misma estructura en la coleccion (muchos documentos juntos).
const userSchema = new mongoose.Schema({
    // Lo que requiere cada dato para ser valido.
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "El correo no es válido"],
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,   // La propiedad password no sera visible cuando se consulte a un usuario.
    },

    role: {
        type: String,
        enum: ["admin", "coordinador", "auxiliar"],
        default: "auxiliar",
    },

    active: {
        type: Boolean,
        default: true,
    }
},
{
    timestamps: true,  // Crea automaticamente createdAt y updatedAt. Util para auditoria.
    versionKey: false, // Evita que mongo agregue "__v": 0. Esto lo utiliza internamente mongo para control de versiones internar y concurrencia. No lo necesitamos para este proyecto.
});

// Middleware de mongoose : Se ejecuta cuando utiliza el metodo guarda "save" un "Usuario" en este caso.
userSchema.pre("save", async function (next) {
    // this : En este caso se refiere al usuario que se va a guardar.
    // Si la contraseña NO cambio entonces no la vuelva a encriptar
    if (!this.isModified("password")) return next(); // next() : Funcion que da mongoose que dice "Todo correcto puedo continuar"

    try {
        const salt = await bcrypt.genSalt(10);  // .genSalt : Genera un valor aleatorio criptografico. Entre mas rounds, mas complicado de descifrar pero es mas lento en generar.
        this.password = await bcrypt.hash(this.password, salt); // .hash : genera un hash (valor irreversible) aplicando un algoritmo criptográfico a la contraseña junto con un salt. En el resultado estara el algoritomo que utilizo (2b), el costo (10), la salt, y el hash generado. Ejemplo $2b$10$eImiTXuWVxfM37uY4JANjQ==
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", userSchema);