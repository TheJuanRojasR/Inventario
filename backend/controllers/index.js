"use strict";

// Barrel
const authController = require("./auth.controller.js");
const categoryController = require("./category.controller.js");
const subcategoryController = require("./subcategory.controller.js");
const productController = require("./product.controller.js");
const userController = require("./user.controller.js");
const statisticsController = require("./statistics.controller.js");

module.exports = {
    authController,
    categoryController,
    subcategoryController,
    productController,
    userController,
    statisticsController,
};