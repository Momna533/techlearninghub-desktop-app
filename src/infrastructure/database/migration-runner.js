const fs = require("node:fs");
const path = require("node:path");

const migrationsDirectory = path.join(__dirname, "migrations");

function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedMigrations = new Set(
    database
      .prepare("SELECT filename FROM schema_migrations")
      .all()
      .map(({ filename }) => filename),
  );

  const migrationFiles = fs
    .readdirSync(migrationsDirectory)
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  for (const filename of migrationFiles) {
    if (appliedMigrations.has(filename)) continue;

    const sql = fs.readFileSync(
      path.join(migrationsDirectory, filename),
      "utf8",
    );

    database.exec("BEGIN IMMEDIATE;");
    try {
      database.exec(sql);
      database
        .prepare("INSERT INTO schema_migrations (filename) VALUES (?)")
        .run(filename);
      database.exec("COMMIT;");
    } catch (error) {
      database.exec("ROLLBACK;");
      throw new Error(`Database migration failed: ${filename}`, {
        cause: error,
      });
    }
  }
}

module.exports = { runMigrations };
