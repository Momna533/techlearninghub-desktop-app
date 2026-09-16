const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { runMigrations } = require('./migration-runner');

let database;
let activeDatabasePath;

function initializeDatabase({ databasePath }) {
  if (database) return database;

  if (!databasePath) {
    throw new Error('A database path is required to initialize SQLite.');
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec('PRAGMA busy_timeout = 5000;');
  runMigrations(database);
  activeDatabasePath = databasePath;

  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error('SQLite has not been initialized.');
  }

  return database;
}

function getDatabaseStatus() {
  if (!database) {
    return {
      state: 'not initialized'
    };
  }

  return {
    state: 'connected',
    databasePath: activeDatabasePath
  };
}

function closeDatabase() {
  if (!database) return;

  database.close();
  database = undefined;
  activeDatabasePath = undefined;
}

module.exports = { closeDatabase, getDatabase, getDatabaseStatus, initializeDatabase };
