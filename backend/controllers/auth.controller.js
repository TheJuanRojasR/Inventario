"use strict";

const { User } = require("../models/index.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config.js");

// Registro
exports.signup = async (req, res) => {
    try {
        // 1. Crea un usuario (Construccion del objeto). Todavia la contraseña encriptada.
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || "aux",
        });

        // 2. Guarda el usuario. Se ejectua el middelware y hashea la contraseña.
        const savedUser = await user.save();

        // 3. Creando el token
        const token = jwt.sign(
            // payload : Es la identidad del usuario
            {
                id: savedUser.id,
                role: savedUser.role,
                email: savedUser.email,
            },
            // secretOrPrivateKey : Es la clave que solo conoce el servidor. Evita falsificaciones.
            config.secret,
            {
                // expiresIn : Tiempo de vida del token. Depues de X tiempo este muere.
                expiresIn: config.jwtExpiration,
            }
        );

        // 4. Creacion de un DTO. Se envian solo los datos necesarios que necesita el Frontend.
        // ERROR : Enviar toda la informacion del usuario al Frontend ya que no necesita todos los datos.
        const userResponse = {
            id: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };

        // 5. Respuesta. Normalmente el frontend guarda el token en localstorage o cookie. Con este paso pueden hacer "AUTOLOGIN"
        res.status(200).json({
            success: true,
            message: "Usuario registrado correctamente",
            token: token,
            user: userResponse,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al registrar usuario",
            error: error.message,
        });
    }
};

/** 
z * SIGNIN : INICIAR SESION
 * POST /api/auth/signin
 * body { email o usuario, password }
 * Busca el usuario por email o username
 * Valida la contraseña con bcrypt
 * Si es correcto el token JWT
 * Token se usa para autenticar futuras solicitudes
 */

exports.signin = async (req, res) => {
    try {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({
                success: false,
                message: "email o username requerido",
            });
        }

        if (!req.body.password) {
            return res.status(400).json({
                success: false,
                message: "password requerido",
            });
        }

        const user = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email },
            ]
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        if (!user.password) {
            return res.status(500).json({
                success: false,
                message: "Error interno: usuario sin contraseña",
            });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta",
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration },
        )

        const UserResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }

        res.status(200).json({
            success: true,
            message: "Inicio de sesion exitoso",
            token: token,
            user: UserResponse,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al iniciar sesion",
            error: error.message,
        })
    }
};