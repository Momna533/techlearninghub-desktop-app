const express = require('express');
const { getHealth } = require('../controllers/health.controller');

function createHealthRouter() {
  const router = express.Router();
  router.get('/', getHealth);
  return router;
}

module.exports = { createHealthRouter };
