const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');

const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  listClients,
  getClientById,
  createNewClient,
  updateExistingClient,
  deactivateExistingClient,
  archiveExistingClient,
} = require('../../src/application/services/client.service');

function registerClientIpc({ ipcMain }) {
  ipcMain.handle('clients:list', (_event, filters) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        clients: listClients(filters ?? {}),
      };
    } catch (error) {
      console.error('[clients:list]', error);

      return {
        success: false,
        code: error.code || 'CLIENTS_LIST_FAILED',
        message: error.message || 'Failed to load clients.',
      };
    }
  });

  ipcMain.handle('clients:get', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        client: getClientById(id),
      };
    } catch (error) {
      console.error('[clients:get]', error);

      return {
        success: false,
        code: error.code || 'CLIENT_GET_FAILED',
        message: error.message || 'Failed to load client.',
      };
    }
  });

  ipcMain.handle('clients:create', (_event, client) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        client: createNewClient(client ?? {}),
      };
    } catch (error) {
      console.error('[clients:create]', error);

      return {
        success: false,
        code: error.code || 'CLIENT_CREATE_FAILED',
        message: error.message || 'Failed to create client.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('clients:update', (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      const { id, client } = payload ?? {};

      return {
        success: true,
        client: updateExistingClient(id, client ?? {}),
      };
    } catch (error) {
      console.error('[clients:update]', error);

      return {
        success: false,
        code: error.code || 'CLIENT_UPDATE_FAILED',
        message: error.message || 'Failed to update client.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('clients:deactivate', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        client: deactivateExistingClient(id),
      };
    } catch (error) {
      console.error('[clients:deactivate]', error);

      return {
        success: false,
        code: error.code || 'CLIENT_DEACTIVATE_FAILED',
        message: error.message || 'Failed to deactivate client.',
      };
    }
  });

  ipcMain.handle('clients:archive', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_CLIENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        client: archiveExistingClient(id),
      };
    } catch (error) {
      console.error('[clients:archive]', error);

      return {
        success: false,
        code: error.code || 'CLIENT_ARCHIVE_FAILED',
        message: error.message || 'Failed to archive client.',
      };
    }
  });
}

module.exports = {
  registerClientIpc,
};