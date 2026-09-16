const { getDatabaseHealth } = require('../../infrastructure/database/health.repository');

function getFoundationStatus() {
  const database = getDatabaseHealth();

  return {
    message: `Secure IPC is connected. SQLite ${database.version} is healthy.`,
    database
  };
}

module.exports = { getFoundationStatus };
