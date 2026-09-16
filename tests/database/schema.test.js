const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const connection = require('../../src/infrastructure/database/connection');

const databasePath = path.join(os.tmpdir(), `techlearninghub-schema-check-${process.pid}.sqlite`);
const expectedTables = [
  'schema_migrations', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
  'employees', 'documents', 'students', 'courses', 'batches', 'enrollments', 'attendance',
  'student_payments', 'certificates', 'clients', 'leads', 'proposals', 'proposal_items',
  'teams', 'team_members', 'projects', 'project_members', 'milestones', 'tasks',
  'task_assignees', 'support_tickets', 'invoices', 'invoice_items', 'invoice_payments',
  'expenses', 'salary_payments', 'document_links', 'notifications', 'activity_logs', 'settings'
];

try {
  const database = connection.initializeDatabase({ databasePath });
  const tableNames = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map(({ name }) => name);

  for (const tableName of expectedTables) {
    assert.ok(tableNames.includes(tableName), `Missing table: ${tableName}`);
  }

  assert.equal(database.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.deepEqual(database.prepare('PRAGMA foreign_key_check').all(), []);
  assert.throws(
    () => database.exec("INSERT INTO batches (course_id, batch_code, name, start_date) VALUES (999, 'B-001', 'Invalid', '2026-01-01')"),
    /FOREIGN KEY constraint failed/
  );

  database.exec("INSERT INTO courses (course_code, name) VALUES ('C-001', 'Test Course')");
  assert.throws(
    () => database.exec("INSERT INTO batches (course_id, batch_code, name, start_date, capacity) VALUES (1, 'B-002', 'Invalid Capacity', '2026-01-01', 0)"),
    /CHECK constraint failed/
  );

  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get().count, 1);
  connection.closeDatabase();

  const reopenedDatabase = connection.initializeDatabase({ databasePath });
  assert.equal(reopenedDatabase.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get().count, 1);
  console.log(`Schema verification passed with ${expectedTables.length} tables.`);
} finally {
  connection.closeDatabase();
  fs.rmSync(databasePath, { force: true });
  fs.rmSync(`${databasePath}-wal`, { force: true });
  fs.rmSync(`${databasePath}-shm`, { force: true });
}
