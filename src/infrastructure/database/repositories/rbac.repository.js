const { getDatabase } = require("../connection");

function upsertPermission({ code, name, description }) {
  const database = getDatabase();

  database
    .prepare(
      `
      INSERT INTO permissions (code, name, description)
      VALUES (?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `,
    )
    .run(code, name, description ?? null);
}

function upsertRole({ code, name, description, isSystemRole }) {
  const database = getDatabase();

  database
    .prepare(
      `
      INSERT INTO roles (code, name, description, is_system_role)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        is_system_role = excluded.is_system_role,
        updated_at = CURRENT_TIMESTAMP
    `,
    )
    .run(code, name, description ?? null, isSystemRole ? 1 : 0);
}

function getRoleByCode(code) {
  return getDatabase()
    .prepare(
      `
      SELECT id, code, name, description, is_system_role AS isSystemRole
      FROM roles
      WHERE code = ?
      LIMIT 1
    `,
    )
    .get(code);
}

function getPermissionByCode(code) {
  return getDatabase()
    .prepare(
      `
      SELECT id, code, name, description
      FROM permissions
      WHERE code = ?
      LIMIT 1
    `,
    )
    .get(code);
}

function listRoles() {
  return getDatabase()
    .prepare(
      `
      SELECT
        id,
        code,
        name,
        description,
        is_system_role AS isSystemRole
      FROM roles
      ORDER BY name ASC
    `,
    )
    .all();
}

function replaceRolePermissions(roleId, permissionIds) {
  const database = getDatabase();
  const deleteStatement = database.prepare(
    "DELETE FROM role_permissions WHERE role_id = ?",
  );
  const insertStatement = database.prepare(`
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (?, ?)
  `);

  database.exec("BEGIN IMMEDIATE;");
  try {
    deleteStatement.run(roleId);
    for (const permissionId of permissionIds) {
      insertStatement.run(roleId, permissionId);
    }
    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

function assignRole(userId, roleId) {
  getDatabase()
    .prepare(
      `
      INSERT OR IGNORE INTO user_roles (user_id, role_id)
      VALUES (?, ?)
    `,
    )
    .run(userId, roleId);
}

function revokeRole(userId, roleId) {
  getDatabase()
    .prepare(
      `
      DELETE FROM user_roles
      WHERE user_id = ? AND role_id = ?
    `,
    )
    .run(userId, roleId);
}

function getUserRoles(userId) {
  return getDatabase()
    .prepare(
      `
      SELECT
        roles.id,
        roles.code,
        roles.name,
        roles.description
      FROM user_roles
      INNER JOIN roles ON roles.id = user_roles.role_id
      WHERE user_roles.user_id = ?
      ORDER BY roles.name ASC
    `,
    )
    .all(userId);
}

function getUserPermissionCodes(userId) {
  const rows = getDatabase()
    .prepare(
      `
      SELECT DISTINCT permissions.code AS code
      FROM user_roles
      INNER JOIN role_permissions
        ON role_permissions.role_id = user_roles.role_id
      INNER JOIN permissions
        ON permissions.id = role_permissions.permission_id
      WHERE user_roles.user_id = ?
      ORDER BY permissions.code ASC
    `,
    )
    .all(userId);

  return rows.map((row) => row.code);
}

function countUsers() {
  return getDatabase().prepare("SELECT COUNT(*) AS count FROM users").get()
    .count;
}

function findUserById(userId) {
  return getDatabase()
    .prepare(
      `
      SELECT
        id,
        email,
        display_name AS displayName,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(userId);
}

function findUserByEmail(email) {
  return getDatabase()
    .prepare(
      `
      SELECT
        id,
        email,
        display_name AS displayName,
        status
      FROM users
      WHERE email = ?
      COLLATE NOCASE
      LIMIT 1
    `,
    )
    .get(email.trim());
}

module.exports = {
  upsertPermission,
  upsertRole,
  getRoleByCode,
  getPermissionByCode,
  listRoles,
  replaceRolePermissions,
  assignRole,
  revokeRole,
  getUserRoles,
  getUserPermissionCodes,
  countUsers,
  findUserById,
  findUserByEmail,
};
