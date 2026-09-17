const { PERMISSIONS } = require('../../domain/authorization/permission-codes');
const {
  getUserPermissionCodes,
  getUserRoles,
  getRoleByCode,
  assignRole,
  revokeRole,
  listRoles,
  findUserById,
  findUserByEmail,
} = require('../../infrastructure/database/repositories/rbac.repository');
const {
  getCurrentUser,
  isAuthenticated,
} = require('./session.service');

function buildAuthorizationDenial({ code, message, permission }) {
  return {
    success: false,
    code,
    message,
    permission: permission ?? null,
  };
}

function getAuthorizationContext(userId = getCurrentUser()?.id) {
  if (!userId) {
    return {
      authenticated: false,
      userId: null,
      roles: [],
      permissions: [],
    };
  }

  return {
    authenticated: true,
    userId,
    roles: getUserRoles(userId),
    permissions: getUserPermissionCodes(userId),
  };
}

function hasPermission(permissionCode, userId = getCurrentUser()?.id) {
  if (!userId || typeof permissionCode !== 'string' || !permissionCode) {
    return false;
  }

  return getUserPermissionCodes(userId).includes(permissionCode);
}

function hasAnyPermission(permissionCodes, userId = getCurrentUser()?.id) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return false;
  }

  const granted = new Set(getUserPermissionCodes(userId));
  return permissionCodes.some((code) => granted.has(code));
}

function hasAllPermissions(permissionCodes, userId = getCurrentUser()?.id) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return false;
  }

  const granted = new Set(getUserPermissionCodes(userId));
  return permissionCodes.every((code) => granted.has(code));
}

/**
 * Security boundary helper for main-process / IPC operations.
 * Always call this (or requireAuthenticated) before privileged work.
 */
function requirePermission(permissionCode) {
  if (!isAuthenticated()) {
    return buildAuthorizationDenial({
      code: 'UNAUTHENTICATED',
      message: 'Authentication is required.',
      permission: permissionCode,
    });
  }

  const currentUser = getCurrentUser();

  if (!currentUser?.id) {
    return buildAuthorizationDenial({
      code: 'UNAUTHENTICATED',
      message: 'Authentication is required.',
      permission: permissionCode,
    });
  }

  const databaseUser = findUserById(currentUser.id);

  if (!databaseUser) {
    return buildAuthorizationDenial({
      code: 'UNAUTHENTICATED',
      message: 'The current user account could not be found.',
      permission: permissionCode,
    });
  }

  if (databaseUser.status !== 'active') {
    return buildAuthorizationDenial({
      code: 'FORBIDDEN',
      message: 'Your account is not active.',
      permission: permissionCode,
    });
  }

  if (!hasPermission(permissionCode, currentUser.id)) {
    return buildAuthorizationDenial({
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action.',
      permission: permissionCode,
    });
  }

  return null;
}

function requireAuthenticated() {
  if (!isAuthenticated()) {
    return buildAuthorizationDenial({
      code: 'UNAUTHENTICATED',
      message: 'Authentication is required.',
    });
  }

  return null;
}

function enrichUserWithAuthorization(user) {
  if (!user) return null;

  const roles = getUserRoles(user.id);
  const permissions = getUserPermissionCodes(user.id);

  return {
    ...user,
    roles,
    permissions,
  };
}

function listAssignableRoles() {
  return listRoles();
}

function assignRoleToUser({ userId, roleCode }) {
  const denial = requirePermission(PERMISSIONS.RBAC_MANAGE);
  if (denial) return denial;

  if (!userId || typeof roleCode !== 'string' || !roleCode.trim()) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'A user id and role code are required.',
    };
  }

  const user = findUserById(userId);
  if (!user) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'User was not found.',
    };
  }

  const role = getRoleByCode(roleCode.trim());
  if (!role) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Role was not found.',
    };
  }

  assignRole(user.id, role.id);

  return {
    success: true,
    user: enrichUserWithAuthorization(user),
    role: {
      id: role.id,
      code: role.code,
      name: role.name,
    },
  };
}

function assignRoleToUserByEmail({ email, roleCode }) {
  const denial = requirePermission(PERMISSIONS.RBAC_MANAGE);
  if (denial) return denial;

  if (typeof email !== 'string' || !email.trim()) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Email is required.',
    };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'User was not found.',
    };
  }

  return assignRoleToUser({ userId: user.id, roleCode });
}

function revokeRoleFromUser({ userId, roleCode }) {
  const denial = requirePermission(PERMISSIONS.RBAC_MANAGE);
  if (denial) return denial;

  const user = findUserById(userId);
  if (!user) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'User was not found.',
    };
  }

  const role = getRoleByCode(roleCode);
  if (!role) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Role was not found.',
    };
  }

  revokeRole(user.id, role.id);

  return {
    success: true,
    user: enrichUserWithAuthorization(user),
    role: {
      id: role.id,
      code: role.code,
      name: role.name,
    },
  };
}

function performDemoAdminAction() {
  const denial = requirePermission(PERMISSIONS.DEMO_ADMIN_ACTION);
  if (denial) return denial;

  return {
    success: true,
    message: 'Authorized demo admin action completed in the main process.',
  };
}

function performDemoHrAction() {
  const denial = requirePermission(PERMISSIONS.DEMO_HR_ACTION);
  if (denial) return denial;

  return {
    success: true,
    message: 'Authorized demo HR action completed in the main process.',
  };
}

function performDemoFinanceAction() {
  const denial = requirePermission(PERMISSIONS.DEMO_FINANCE_ACTION);
  if (denial) return denial;

  return {
    success: true,
    message: 'Authorized demo finance action completed in the main process.',
  };
}

module.exports = {
  getAuthorizationContext,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAuthenticated,
  enrichUserWithAuthorization,
  listAssignableRoles,
  assignRoleToUser,
  assignRoleToUserByEmail,
  revokeRoleFromUser,
  performDemoAdminAction,
  performDemoHrAction,
  performDemoFinanceAction,
  buildAuthorizationDenial,
};
