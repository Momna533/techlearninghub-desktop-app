const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');

const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  listTeamMembers,
  getTeamMemberById,
  createNewTeamMember,
  updateExistingTeamMember,
  removeExistingTeamMember,
} = require('../../src/application/services/team-member.service');

function registerTeamMemberIpc({ ipcMain }) {
  ipcMain.handle('team-members:list', (_event, filters) => {
    const denial = requirePermission(
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        members: listTeamMembers(filters ?? {}),
      };
    } catch (error) {
      console.error('[team-members:list]', error);

      return {
        success: false,
        code: error.code || 'TEAM_MEMBERS_LIST_FAILED',
        message:
          error.message || 'Failed to load team members.',
      };
    }
  });

  ipcMain.handle('team-members:get', (_event, id) => {
    const denial = requirePermission(
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        member: getTeamMemberById(id),
      };
    } catch (error) {
      console.error('[team-members:get]', error);

      return {
        success: false,
        code: error.code || 'TEAM_MEMBER_GET_FAILED',
        message:
          error.message || 'Failed to load team member.',
      };
    }
  });

  ipcMain.handle('team-members:create', (_event, member) => {
    const denial = requirePermission(
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        member: createNewTeamMember(member ?? {}),
      };
    } catch (error) {
      console.error('[team-members:create]', error);

      return {
        success: false,
        code: error.code || 'TEAM_MEMBER_CREATE_FAILED',
        message:
          error.message || 'Failed to create team member.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('team-members:update', (_event, payload) => {
    const denial = requirePermission(
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
    );

    if (denial) return denial;

    try {
      const { id, member } = payload ?? {};

      return {
        success: true,
        member: updateExistingTeamMember(
          id,
          member ?? {},
        ),
      };
    } catch (error) {
      console.error('[team-members:update]', error);

      return {
        success: false,
        code: error.code || 'TEAM_MEMBER_UPDATE_FAILED',
        message:
          error.message || 'Failed to update team member.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('team-members:remove', (_event, id) => {
    const denial = requirePermission(
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        member: removeExistingTeamMember(id),
      };
    } catch (error) {
      console.error('[team-members:remove]', error);

      return {
        success: false,
        code: error.code || 'TEAM_MEMBER_REMOVE_FAILED',
        message:
          error.message || 'Failed to remove team member.',
      };
    }
  });
}

module.exports = {
  registerTeamMemberIpc,
};