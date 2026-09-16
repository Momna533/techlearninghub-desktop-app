const { getDatabase } = require('./connection');

function getDatabaseHealth() {
  const database = getDatabase();
  const result = database.prepare('SELECT sqlite_version() AS version').get();

  return {
    state: 'connected',
    engine: 'SQLite',
    version: result.version
  };
}

module.exports = { getDatabaseHealth };
