"use strict";

// Barrel
const { authenticate, authorize } = require("./auth.js");
const { verifyToken } = require("./authJwt.js");
const { checkRole } = require("./role.js");
const { checkDuplicateUsernameOrEmail, checkRolesExisted } = require("./verifySingUp.js");

module.exports = {
    authenticate,
    authorize,
    verifyToken,
    checkRole,
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
};