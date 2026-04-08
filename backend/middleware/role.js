"use strict";

/**
 * MIDDLEWARE CONTROL DE ROLES DE USUARIO
 * 
 * Sirve para verificar que el usuario autnticado tiene permisos necesarios para acceder a una ruta especifica 
 * Funcion factory checkRole() permite especificar los roles permitidos
 * Funcion Helper para roles especificos isAdmin, isCoordinador, isAuxiliar
 * Requiere que veryfyTokenFn se haya ejecutado primero
 * Flujo :
 * Verifica que req.userRole exista
 * Compara req.userRole contra lista de roles permitidos
 * Si esta en la lista continua
 * Si no esta en la lista retorna 403 Forbidden con mensaje descriptivo
 * Si no existe userRole retorna 401 (Token corructo)
 * 
 * Uso : 
 * checkRole("admin") solo admin
 * checkRole("admin", "coordinador") admin y coordinador con permisos
 * checkRole("admin", "coordinador", "auxiliar") todos con permisos
 * 
 * Roles del sistema :
 * admin : acceso total
 * coordinador : no puede eliminar ni gestionar usuarios
 * auxiliar : acceso limitado a tareas especificar
 */

/**
 * Factory function checkRole
 * Eetorna middleware que verifica si el usuario tienen uno de los roles permitidos
 * @param { ...string } allowedRoles : Roles permitidos en el sistema
 * @param { function } middleware de express
 */

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Validar que el usuario fue autenticado y verifyToken ejecutado
        // req.userRole es establecido por verifyToken middleware
        if (!req.userRole) {
            return res.status(401).json({
                success: false,
                message: "Token invalido o expirado",
            });
        }

        // Soporta que allowedRoles sea un array de arrays (por ejemplo checkRole(["admin", "coordinador"]))
        const allowed = allowedRoles.flat ? allowedRoles.flat() : allowedRoles;

        // Verifica si el rol del usuario esta en la lista de roles permitidos
        if (!allowed.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Permisos insuficientes. Se requiere ${allowed.join(" o ")}`,
            });
        }

        // Usuario tiene permiso continuar
        next();
    }
};

// Funciones helper para roles especificos
// Verifica que el usuario es admin
// uso : routes.delete("/admin-only".verifyToken, isAdmin, controller.method)
const isAdmin = (req, res, next) => {
    return checkRole("admin")(req, res, next);
}

const isCoordinador = (req, res, next) => {
    return checkRole("coord")(req, res, next);
}

const isAuxiliar = (req, res, next) => {
    return checkRole("aux")(req, res, next);
}

// Modulos a exportar
module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar,
};