const {
  authenticateUser,
} = require('../../src/application/services/authentication.service');

const {
  setCurrentUser,
  getCurrentUser,
  isAuthenticated,
  clearCurrentUser,
} = require('../../src/application/services/session.service');

const {
  enrichUserWithAuthorization,
} = require('../../src/application/services/authorization.service');

function registerAuthIpc({ ipcMain }) {
  ipcMain.handle('auth:login', async (_event, credentials) => {
    const result = await authenticateUser(credentials);

    if (!result.success) {
      return result;
    }

    const authorizedUser = enrichUserWithAuthorization(result.user);
    setCurrentUser(authorizedUser);

    return {
      success: true,
      user: getCurrentUser(),
    };
  });

  ipcMain.handle('auth:get-session', () => {
    if (!isAuthenticated()) {
      return {
        authenticated: false,
        user: null,
      };
    }

    // Refresh roles/permissions from DB so assignment changes apply mid-session.
    const authorizedUser = enrichUserWithAuthorization(getCurrentUser());
    setCurrentUser(authorizedUser);

    return {
      authenticated: true,
      user: getCurrentUser(),
    };
  });

  ipcMain.handle('auth:logout', () => {
    clearCurrentUser();

    return {
      success: true,
    };
  });
}

module.exports = {
  registerAuthIpc,
};
