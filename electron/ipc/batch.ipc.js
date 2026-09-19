const {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  findActiveCourses,
  findTrainerEmployees,
} = require("../../src/application/services/batch.service");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

function handleError(error) {
  console.error("Batches IPC error:", error);

  return {
    success: false,
    code: error.code || "BATCH_OPERATION_FAILED",
    message: error.message || "Batch operation failed.",
    details: error.details || null,
  };
}

function registerBatchesIpc({ ipcMain }) {
  ipcMain.handle("batches:list", async (_event, filters = {}) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        batches: getBatches(filters),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("batches:get", async (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        batch: getBatch(id),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("batches:create", async (_event, batch) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_MANAGE);

    if (denial) return denial;

    try {
      return {
        success: true,
        batch: createBatch(batch),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("batches:update", async (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_MANAGE);

    if (denial) return denial;

    try {
      if (!payload || !payload.id) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: "Batch id is required.",
        };
      }

      return {
        success: true,
        batch: updateBatch(payload.id, payload.batch),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("batches:courses", async () => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        courses: findActiveCourses(),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("batches:trainers", async () => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_BATCHES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        trainers: findTrainerEmployees(),
      };
    } catch (error) {
      return handleError(error);
    }
  });
}

module.exports = {
  registerBatchesIpc,
};
