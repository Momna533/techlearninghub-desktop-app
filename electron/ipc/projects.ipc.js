const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  getProjects,
  getProject,
  createNewProject,
  editProject,
  changeProjectStatus,
} = require("../../src/application/services/projects.service");

function registerProjectIpc({ ipcMain }) {
  ipcMain.handle("projects:list", (_event, filters) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        projects: getProjects(filters ?? {}),
      };
    } catch (error) {
      console.error("[projects:list]", error);

      return {
        success: false,
        code: error.code || "PROJECTS_LIST_FAILED",
        message: error.message || "Failed to load projects.",
      };
    }
  });

  ipcMain.handle("projects:get", (_event, id) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        project: getProject(id),
      };
    } catch (error) {
      console.error("[projects:get]", error);

      return {
        success: false,
        code: error.code || "PROJECT_GET_FAILED",
        message: error.message || "Failed to load project.",
      };
    }
  });

  ipcMain.handle("projects:create", (_event, project) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        project: createNewProject(project ?? {}),
      };
    } catch (error) {
      console.error("[projects:create]", error);

      return {
        success: false,
        code: error.code || "PROJECT_CREATE_FAILED",
        message: error.message || "Failed to create project.",
        details: error.details || null,
      };
    }
  });

  ipcMain.handle("projects:update", (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      const { id, project } = payload ?? {};

      return {
        success: true,
        project: editProject(id, project ?? {}),
      };
    } catch (error) {
      console.error("[projects:update]", error);

      return {
        success: false,
        code: error.code || "PROJECT_UPDATE_FAILED",
        message: error.message || "Failed to update project.",
        details: error.details || null,
      };
    }
  });

  ipcMain.handle("projects:change-status", (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (denial) return denial;

    try {
      const { id, status } = payload ?? {};

      return {
        success: true,
        project: changeProjectStatus(id, status),
      };
    } catch (error) {
      console.error("[projects:change-status]", error);

      return {
        success: false,
        code: error.code || "PROJECT_STATUS_CHANGE_FAILED",
        message: error.message || "Failed to change project status.",
        details: error.details || null,
      };
    }
  });
}

module.exports = {
  registerProjectIpc,
};
