"use strict";

/**
 * Controlador de usuarios
 * Este modulo maneja todas las operaciones del CRUD para gestion de usuarios
 * incluye control de acceso basado en roles
 * Roles permitidos admin, coordinador, auxiliar
 * Seguridad
 * Las contrase;as nunca se devuelven en respuestas
 * Los auxiliare no pueden ver otros y actualizar otros usuarios
 * los coordinadores no puden ver los administradores
 * activar y desactivar usuarios
 * eliminar permanentemente un usuario solo admin
 * 
 * operaciones
 * getAlluser : Listar usuarios con filtro por rol
 * getuserById : obtener usuario especifico
 * createUser : crear un nuevo usuario con validacion
 * updateUser : actualizar usuario con restricciones de rol
 * deleteUser : eliminar usuario con restriccion de rol
 */

const { User } = require("../models/index");
const bcrypt = require("bcryptjs");

/**
 * Obtener lista de usuarios
 * GET /api/users
 * Auth token requerido
 * query params incluir activo o desativados
 * 
 * retornar
 *  - 200 : array de usuarios filtrados
 *  - 500 : Error de servidor
 */

exports.getAllUsers = async (req, res) => {
    try {
        // Por defecto solo mostrar usuarios activos
        const includeInactive = req.query.includeInactive === "true";
        const activeFilter = includeInactive ? {} : { active: { $ne: false} };

        let users;
        // control de acceso basado en rol
        if (req.userRole === "aux") {
            // Los auxiliares solo pueden verse a si mismo
            users = await User.find({ _id: req.userId, ...activeFilter }).select("-password");
        } else {
            // Los admin y coordinadores ven todos los usuarios
            users = await User.find(activeFilter).select("-password");
        }

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("[CONTROLLER] Error en getAllUsers: ", error.message);
        res.status(500).json({
            success: false,
            message: "Error al obtener todos los usuarios",
        });
    }
};

/**
 * READ obtener un usuario especifico por id
 * GET /api/users/:id
 * Auth token requerido
 * Retorna
 *  - 200 : usuario encontrado
 *  - 403 : sin permiso para ver el usuario
 *  - 404 : usuario no encontrado
 *  - 500 : error de servidor
 */

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // validaciones de acceso
        // Los auxiliares solo pueden ver su propio perfil
        if (req.userRole === "aux" && req.userId !== user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tiene permiso para ver este usuario",
            });
        }

        // Los coordinadores no pueden ver administradores
        if (req.userRole === "coord" && user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "No puede ver administradores",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Error en getUserById: ", error);
        res.status(500).json({
            success: false,
            message: "Error al encontrar al usuario especifico",
            error: error.message,
        });
    }
};

/**
 * CREATE crear un nuevo usuario
 * POST /api/users
 * Auth Bearer token requerido
 * Roles admin, y coordinador (con restricciones)
 * validaciones
 * - 201 : usuario creado
 * - 400 : validacion fallida
 * - 500 : error de servidor
 */

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        //  Crear usuario nuevo
        const user = new User({
            username,
            email,
            password,
            role,
        });

        // Guardar en DB
        const savedUser = await user.save();

        res.status(201).json({
            success: true,
            message: "Usuario creado",
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
            }
        });
    } catch (error) {
        console.error("Error en createUser: ", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        });
    }
};

/**
 * UPDATE actualizar un usuario existente
 * PUT /api/users/:id
 * Auth Bearer token requerido
 * validaciones
 * auxiliar : solo puede actualizar su propio perfil
 * auxiliar : no puede cambiar su rol
 * admin, coordinador: pueden actualizar otros usuarios
 * return
 * - 200 : usuario actualizado
 * - 403 : sin permiso para actualizar
 * - 404 : usuario no encontrado
 * - 500 : error del servidor
 */

exports.updateUser = async (req, res) => {
    try {
        // Restrinccion : auxiliar solo puede actualizar su propio perfil
        if (req.userRole === "aux" && req.userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: "No tiene permiso para actualizar este usuario.",
            });
        }

        // Restrinccion : auxiliar no puede cambiar su rol
        if (req.userRole === "aux" && req.body.role) {
            return res.status(403).json({
                success: false,
                message: "No tiene permiso para modificar su rol.",
            });
        }

        // Por defecto mongoose no ejecuta validaciones en los update, por eso toca activarlos
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            // new : true : Devuelve el documento despues de ser actualizado
            // runValidators : true : Ejecuta las validaciones puestas en el esquema
            // context : "query" : Le dice a mongoose que el contexto de validacion es una Query y no un documento
            { new: true, runValidators: true, context: "query" }
        ).select("-password"); // No retorna contrasena 

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            })
        }

        res.status(200).json({
            success: true,
            message: "Usuario actualizado exitosamente.",
            data: updatedUser,
        })
    } catch (error) {
        console.error("Error en updateUser: ", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar usuario.",
            error: error.message,
        })
    }
};

/**
 * DELETE eliminar usuario
 * delete /api/users/:id
 * roles: admin
 * query params:
 * hardDelete = true : eliminar permanentemente
 * default soft delete desactivar
 * 
 * El admin solo puede desactivar otro admin
 * return
 * - 200 : usuario eliminado o desactivado
 * - 403 : sin permiso para eliminar
 * - 404 : usuario no encontrado
 * - 500 : error de servidor
 */

exports.deleteUser = async (req, res) => {
    try {
        const isHardDelete = req.query.hardDelete === "true";
        const userToDelete = await User.findById(req.params.id);

        if (req.userRole !== "admin") {
            return res.status(403).json({
                success: false,
                message: "No puede eliminar un usuario.",
            });
        }

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado.",
            })
        }

        // No puede eliminar a otros admin
        if (userToDelete.role === "admin" && userToDelete._id.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tiene permiso para eliminar o desactivar administradores",
            })
        }

        if (isHardDelete) {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Usuario eliminado exitosamente.",
                data: userToDelete,
            });
        } else {
            userToDelete.active = false;
            
            await userToDelete.save();

            res.status(200).json({
                success: true,
                message: "usuario desactivado exitosamente (soft delete).",
                data: userToDelete,
            });
        }
    } catch (error) {
        console.error("Error en deleteUser: ", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar un usuario.",
            error: error.message,
        });
    }
};