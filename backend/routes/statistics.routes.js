"use strict";

/**
 * RUTAS DE ESTADISTICAS
 * 
 * Define el endpoint para obtener las estadisticas generales del sistema
 */

const express = require("express");
const router = express.Router();

const { getStatistics } = require("../controllers/statistics.controller.js");

// GET /api/statistics obtiene las estadisticas del sistema
router.get("/", getStatistics);

module.exports = router;