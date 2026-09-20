const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');

const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  listTeams,
  getTeamById,
  createNewTeam,
  updateExistingTeam,
  deactivateExistingTeam,
  archiveExistingTeam,
} = require('../../src/application/services/team.service');

function registerTeamIpc({ ipcMain }) {
  ipcMain.handle('teams:list', (_event, filters) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        teams: listTeams(filters ?? {}),
      };
    } catch (error) {
      console.error('[teams:list]', error);

      return {
        success: false,
        code: error.code || 'TEAMS_LIST_FAILED',
        message: error.message || 'Failed to load teams.',
      };
    }
  });

  ipcMain.handle('teams:get', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        team: getTeamById(id),
      };
    } catch (error) {
      console.error('[teams:get]', error);

      return {
        success: false,
        code: error.code || 'TEAM_GET_FAILED',
        message: error.message || 'Failed to load team.',
      };
    }
  });

  ipcMain.handle('teams:create', (_event, team) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        team: createNewTeam(team ?? {}),
      };
    } catch (error) {
      console.error('[teams:create]', error);

      return {
        success: false,
        code: error.code || 'TEAM_CREATE_FAILED',
        message: error.message || 'Failed to create team.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('teams:update', (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      const { id, team } = payload ?? {};

      return {
        success: true,
        team: updateExistingTeam(id, team ?? {}),
      };
    } catch (error) {
      console.error('[teams:update]', error);

      return {
        success: false,
        code: error.code || 'TEAM_UPDATE_FAILED',
        message: error.message || 'Failed to update team.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('teams:deactivate', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        team: deactivateExistingTeam(id),
      };
    } catch (error) {
      console.error('[teams:deactivate]', error);

      return {
        success: false,
        code: error.code || 'TEAM_DEACTIVATE_FAILED',
        message: error.message || 'Failed to deactivate team.',
      };
    }
  });

  ipcMain.handle('teams:archive', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_TEAMS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        team: archiveExistingTeam(id),
      };
    } catch (error) {
      console.error('[teams:archive]', error);

      return {
        success: false,
        code: error.code || 'TEAM_ARCHIVE_FAILED',
        message: error.message || 'Failed to archive team.',
      };
    }
  });
}

module.exports = {
  registerTeamIpc,
};