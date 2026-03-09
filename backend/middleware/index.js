"use strict";

// Barrel
const authenticate = require("./auth.js");
const authorize = require("./auth.js");
const verifyTokenFn = require("./authJwt.js");
const checkRole = require("./role.js");
const checkDuplicateUsernameOrEmail = require("./verifySingUp.js");
const checkRolesExisted = require("./verifySingUp.js");

module.exports = {
    authenticate,
    authorize,
    verifyTokenFn,
    checkRole,
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
};