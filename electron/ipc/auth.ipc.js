const {
  authenticateUser,
} = require('../../src/application/services/authentication.service');

const {
  setCurrentUser,
  getCurrentUser,
  isAuthenticated,
  clearCurrentUser,
} = require('../../src/application/services/session.service');

function registerAuthIpc({ ipcMain }) {
  ipcMain.handle('auth:login', async (_event, credentials) => {
    const result = await authenticateUser(credentials);

    if (!result.success) {
      return result;
    }

    setCurrentUser(result.user);

    return {
      success: true,
      user: getCurrentUser(),
    };
  });

  ipcMain.handle('auth:get-session', () => ({
    authenticated: isAuthenticated(),
    user: getCurrentUser(),
  }));

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