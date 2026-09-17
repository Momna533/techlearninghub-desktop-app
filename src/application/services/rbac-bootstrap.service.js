const {
  PERMISSION_DEFINITIONS,
} = require('../../domain/authorization/permission-codes');
const {
  ROLE_DEFINITIONS,
} = require('../../domain/authorization/role-definitions');
const {
  upsertPermission,
  upsertRole,
  getRoleByCode,
  getPermissionByCode,
  replaceRolePermissions,
  assignRole,
  findUserByEmail,
} = require('../../infrastructure/database/repositories/rbac.repository');

const { createUser } = require('./authentication.service');

function syncRbacCatalog() {
  for (const permission of PERMISSION_DEFINITIONS) {
    upsertPermission(permission);
  }

  for (const role of ROLE_DEFINITIONS) {
    upsertRole({
      code: role.code,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
    });

    const storedRole = getRoleByCode(role.code);
    const permissionIds = role.permissions.map((permissionCode) => {
      const permission = getPermissionByCode(permissionCode);
      if (!permission) {
        throw new Error(`Unknown permission code during RBAC sync: ${permissionCode}`);
      }
      return permission.id;
    });

    replaceRolePermissions(storedRole.id, permissionIds);
  }
}

/**
 * Creates local demo accounts only when the users table is empty so login/RBAC
 * can be exercised immediately after a fresh install.
 */
async function ensureBootstrapUsers() {
  const bootstrapAccounts = [
    {
      email: 'superadmin@techlearninghub.local',
      password: 'SuperAdmin123!',
      displayName: 'Super Admin',
      roleCode: 'super_admin',
    },
    {
      email: 'developer@techlearninghub.local',
      password: 'Developer123!',
      displayName: 'Demo Developer',
      roleCode: 'developer',
    },
    {
      email: 'hr@techlearninghub.local',
      password: 'HrUser123!',
      displayName: 'Demo HR',
      roleCode: 'hr',
    },
  ];

  const createdUsers = [];

  for (const account of bootstrapAccounts) {
   const existingUser = findUserByEmail(account.email);

    if (existingUser) {
      continue;
    }

    const user = await createUser({
      email: account.email,
      password: account.password,
      displayName: account.displayName,
      skipAuthorizationCheck: true,
    });

    const role = getRoleByCode(account.roleCode);

    if (!role) {
      throw new Error(
        `Bootstrap role not found: ${account.roleCode}`,
      );
    }

    assignRole(user.id, role.id);

    createdUsers.push({
      email: user.email,
      role: account.roleCode,
    });
  }

  return {
    created: createdUsers.length > 0,
    users: createdUsers,
  };
}
async function bootstrapAuthorization() {
  syncRbacCatalog();
  const bootstrapUsers = await ensureBootstrapUsers();
  return { bootstrapUsers };
}

module.exports = {
  syncRbacCatalog,
  ensureBootstrapUsers,
  bootstrapAuthorization,
};
