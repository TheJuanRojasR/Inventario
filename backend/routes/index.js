"use strict";

// Barrel
const authRoutes = require("./auth.routes.js");
const categoryRoutes = require("./category.routes.js");
const subCategoryRoutes = require("./subcategory.routes.js");
const productRoutes = require("./product.routes.js");
const userRoutes = require("./user.routes.js");
const statisticRoutes = require("./statistics.routes.js");

module.exports = {
    authRoutes,
    categoryRoutes,
    subCategoryRoutes,
    productRoutes,
    userRoutes,
    statisticRoutes,
};