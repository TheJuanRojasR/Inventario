"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { saltRounds } = require("../config/auth.config");

const userSchema = new mongoose.Schema(
    {
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
            select: false,
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
        timestamps: true,
        versionKey: false,
    }
);

// Middleware de mongoose : Se ejecuta antes de guardar (save) a un "Usuario" en este caso.
userSchema.pre("save", async function (next) {
    // Si la contraseña NO cambio entonces no la vuelva a encriptar
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(saltRounds);
        // Hasheamos la contraseña antes de guardar para seguridad
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", userSchema);