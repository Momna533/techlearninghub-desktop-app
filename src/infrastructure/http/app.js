const express = require('express');
const { createHealthRouter } = require('./routes/health.routes');

function createHttpApp() {
  const httpApp = express();
  httpApp.use(express.json());
  httpApp.use('/health', createHealthRouter());
  return httpApp;
}

module.exports = { createHttpApp };
