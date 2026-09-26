const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  listProjectMembers,
  getProjectMemberById,
  createNewProjectMember,
  updateExistingProjectMember,
  removeExistingProjectMember,
} = require("../../src/application/services/project-member.service");

function registerProjectMemberIpc({ ipcMain }) {
  ipcMain.handle("project-members:list", (_event, filters) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        members: listProjectMembers(filters ?? {}),
      };
    } catch (error) {
      console.error("[project-members:list]", error);

      return {
        success: false,
        code: error.code || "PROJECT_MEMBERS_LIST_FAILED",
        message: error.message || "Failed to load project members.",
      };
    }
  });

  ipcMain.handle("project-members:get", (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        member: getProjectMemberById(id),
      };
    } catch (error) {
      console.error("[project-members:get]", error);

      return {
        success: false,
        code: error.code || "PROJECT_MEMBER_GET_FAILED",
        message: error.message || "Failed to load project member.",
      };
    }
  });

  ipcMain.handle("project-members:create", (_event, member) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        member: createNewProjectMember(member ?? {}),
      };
    } catch (error) {
      console.error("[project-members:create]", error);

      return {
        success: false,
        code: error.code || "PROJECT_MEMBER_CREATE_FAILED",
        message: error.message || "Failed to create project member.",
        details: error.details || null,
      };
    }
  });

  ipcMain.handle("project-members:update", (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      const { id, member } = payload ?? {};

      return {
        success: true,
        member: updateExistingProjectMember(id, member ?? {}),
      };
    } catch (error) {
      console.error("[project-members:update]", error);

      return {
        success: false,
        code: error.code || "PROJECT_MEMBER_UPDATE_FAILED",
        message: error.message || "Failed to update project member.",
        details: error.details || null,
      };
    }
  });

  ipcMain.handle("project-members:remove", (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        member: removeExistingProjectMember(id),
      };
    } catch (error) {
      console.error("[project-members:remove]", error);

      return {
        success: false,
        code: error.code || "PROJECT_MEMBER_REMOVE_FAILED",
        message: error.message || "Failed to remove project member.",
      };
    }
  });
}

module.exports = {
  registerProjectMemberIpc,
};
