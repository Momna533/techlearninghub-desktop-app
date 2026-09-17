const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const connection = require('../../src/infrastructure/database/connection');
const { bootstrapAuthorization } = require('../../src/application/services/rbac-bootstrap.service');
const { createUser } = require('../../src/application/services/authentication.service');
const {
  setCurrentUser,
  clearCurrentUser,
} = require('../../src/application/services/session.service');
const {
  enrichUserWithAuthorization,
  hasPermission,
  performDemoAdminAction,
  performDemoHrAction,
  assignRoleToUser,
  requirePermission,
} = require('../../src/application/services/authorization.service');
const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');
const { ROLES } = require('../../src/domain/authorization/role-definitions');
const {
  getRoleByCode,
  assignRole,
  getUserPermissionCodes,
} = require('../../src/infrastructure/database/repositories/rbac.repository');

function userHasPermission(user, permissionCode) {
  return Array.isArray(user?.permissions)
    && user.permissions.includes(permissionCode);
}

const databasePath = path.join(
  os.tmpdir(),
  `techlearninghub-rbac-check-${process.pid}.sqlite`,
);

async function main() {
  try {
    connection.initializeDatabase({ databasePath });
    await bootstrapAuthorization();

    const superAdmin = enrichUserWithAuthorization({
      id: 1,
      email: 'superadmin@techlearninghub.local',
      displayName: 'Super Admin',
      status: 'active',
    });

    const developer = enrichUserWithAuthorization({
      id: 2,
      email: 'developer@techlearninghub.local',
      displayName: 'Demo Developer',
      status: 'active',
    });

    const hrUser = enrichUserWithAuthorization({
      id: 3,
      email: 'hr@techlearninghub.local',
      displayName: 'Demo HR',
      status: 'active',
    });

    // Authorized action (main-process security boundary)
    setCurrentUser(superAdmin);
    const authorized = performDemoAdminAction();
    assert.equal(authorized.success, true);
    assert.match(authorized.message, /Authorized demo admin action/);

    // Unauthorized action for developer role
    setCurrentUser(developer);
    const unauthorized = performDemoAdminAction();
    assert.equal(unauthorized.success, false);
    assert.equal(unauthorized.code, 'FORBIDDEN');
    assert.equal(unauthorized.permission, PERMISSIONS.DEMO_ADMIN_ACTION);

    // Hidden UI action equivalent: frontend helper mirrors permission set
    assert.equal(
      userHasPermission(developer, PERMISSIONS.DEMO_ADMIN_ACTION),
      false,
      'Developer UI must hide admin action',
    );
    assert.equal(
      userHasPermission(hrUser, PERMISSIONS.DEMO_HR_ACTION),
      true,
      'HR UI may show HR action',
    );
    assert.equal(
      userHasPermission(developer, PERMISSIONS.DEMO_HR_ACTION),
      false,
      'Developer UI must hide HR action',
    );

    // Direct unauthorized operation attempt still denied by backend check
    clearCurrentUser();
    const unauthenticatedAttempt = requirePermission(PERMISSIONS.DEMO_ADMIN_ACTION);
    assert.equal(unauthenticatedAttempt.code, 'UNAUTHENTICATED');

    setCurrentUser(developer);
    const directDenied = requirePermission(PERMISSIONS.DEMO_ADMIN_ACTION);
    assert.equal(directDenied.code, 'FORBIDDEN');
    assert.equal(hasPermission(PERMISSIONS.DEMO_ADMIN_ACTION), false);

    // HR authorized for HR action, still forbidden for admin action
    setCurrentUser(hrUser);
    const hrAuthorized = performDemoHrAction();
    assert.equal(hrAuthorized.success, true);
    const hrDeniedAdmin = performDemoAdminAction();
    assert.equal(hrDeniedAdmin.code, 'FORBIDDEN');

    // Role assignment is itself a protected operation
    setCurrentUser(developer);
    const assignDenied = assignRoleToUser({
      userId: developer.id,
      roleCode: ROLES.HR,
    });
    assert.equal(assignDenied.code, 'FORBIDDEN');

    setCurrentUser(superAdmin);
    const assignAllowed = assignRoleToUser({
      userId: developer.id,
      roleCode: ROLES.HR,
    });
    assert.equal(assignAllowed.success, true);
    assert.ok(
      getUserPermissionCodes(developer.id).includes(PERMISSIONS.DEMO_HR_ACTION),
    );

    // Extra user without roles cannot pass authorization
    const bareUser = await createUser({
      email: 'norole@techlearninghub.local',
      password: 'NoRoleUser123!',
      displayName: 'No Role',
    });
    setCurrentUser(enrichUserWithAuthorization(bareUser));
    assert.equal(hasPermission(PERMISSIONS.USERS_VIEW), false);
    assert.equal(performDemoAdminAction().code, 'FORBIDDEN');

    // Granting a role updates effective permissions
    const trainerRole = getRoleByCode(ROLES.TRAINER);
    assignRole(bareUser.id, trainerRole.id);
    setCurrentUser(enrichUserWithAuthorization(bareUser));
    assert.equal(hasPermission(PERMISSIONS.USERS_VIEW), true);
    assert.equal(hasPermission(PERMISSIONS.DEMO_ADMIN_ACTION), false);

    console.log('RBAC authorization checks passed.');
  } finally {
    clearCurrentUser();
    connection.closeDatabase();
    fs.rmSync(databasePath, { force: true });
    fs.rmSync(`${databasePath}-wal`, { force: true });
    fs.rmSync(`${databasePath}-shm`, { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
