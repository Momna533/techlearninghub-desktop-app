const {
  listMilestones,
  getMilestoneById,
  createNewMilestone,
  updateExistingMilestone,
  changeMilestoneStatus,
} = require("../../src/application/services/milestones.service");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

function registerMilestoneIpc({ ipcMain }) {
  ipcMain.handle("milestones:list", async (event, filters = {}) => {
    requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    return listMilestones(filters);
  });

  ipcMain.handle("milestones:get", async (event, id) => {
    requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    return getMilestoneById(id);
  });

  ipcMain.handle("milestones:create", async (event, milestone) => {
    requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    return createNewMilestone(milestone);
  });

  ipcMain.handle("milestones:update", async (event, payload) => {
    requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (!payload) {
      throw new Error("Milestone update payload is required.");
    }

    return updateExistingMilestone(payload.id, payload.milestone);
  });

  ipcMain.handle("milestones:change-status", async (event, payload) => {
    requirePermission(PERMISSIONS.SOFTWARE_PROJECTS_VIEW);

    if (!payload) {
      throw new Error("Milestone status payload is required.");
    }

    return changeMilestoneStatus(payload.id, payload.status);
  });
}

module.exports = {
  registerMilestoneIpc,
};
