const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');
const {
  requirePermission,
  listAssignableRoles,
  assignRoleToUserByEmail,
  revokeRoleFromUser,
  performDemoAdminAction,
  performDemoHrAction,
  performDemoFinanceAction,
  hasPermission,
} = require('../../src/application/services/authorization.service');
const { getCurrentUser } = require('../../src/application/services/session.service');

function registerRbacIpc({ ipcMain }) {
  ipcMain.handle('rbac:list-roles', () => {
    const denial = requirePermission(PERMISSIONS.RBAC_MANAGE);
    if (denial) return denial;

    return {
      success: true,
      roles: listAssignableRoles(),
    };
  });

  ipcMain.handle('rbac:assign-role', (_event, payload) => (
    assignRoleToUserByEmail(payload ?? {})
  ));

  ipcMain.handle('rbac:revoke-role', (_event, payload) => (
    revokeRoleFromUser(payload ?? {})
  ));

  ipcMain.handle('rbac:demo-admin-action', () => performDemoAdminAction());

  ipcMain.handle('rbac:demo-hr-action', () => performDemoHrAction());

  ipcMain.handle('rbac:demo-finance-action', () => performDemoFinanceAction());

  ipcMain.handle('rbac:check-permission', (_event, permissionCode) => ({
    authenticated: Boolean(getCurrentUser()),
    permission: permissionCode,
    allowed: hasPermission(permissionCode),
  }));
}

module.exports = {
  registerRbacIpc,
};
