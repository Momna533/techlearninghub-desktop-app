const {
  getEnrollments,
  getEnrollment,
  getStudentEnrollments,
  getBatchEnrollments,
  createEnrollment,
  updateEnrollment,
  updateEnrollmentStatus,
} = require("../../src/application/services/enrollments.service");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

function handleError(error) {
  console.error("Enrollments IPC error:", error);

  return {
    success: false,
    code: error.code || "ENROLLMENT_OPERATION_FAILED",
    message: error.message || "Enrollment operation failed.",
    details: error.details || null,
  };
}

function registerEnrollmentsIpc({ ipcMain }) {
  ipcMain.handle("enrollments:list", async (_event, filters = {}) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        enrollments: getEnrollments(filters),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:get", async (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        enrollment: getEnrollment(id),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:student", async (_event, studentId) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        enrollments: getStudentEnrollments(studentId),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:batch", async (_event, batchId) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        enrollments: getBatchEnrollments(batchId),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:create", async (_event, enrollment) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_MANAGE);

    if (denial) return denial;

    try {
      return {
        success: true,
        enrollment: createEnrollment(enrollment),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:update", async (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_MANAGE);

    if (denial) return denial;

    try {
      if (!payload || !payload.id) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: "Enrollment id is required.",
        };
      }

      return {
        success: true,
        enrollment: updateEnrollment(payload.id, payload.enrollment),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("enrollments:status", async (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_MANAGE);

    if (denial) return denial;

    try {
      if (!payload || !payload.id) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: "Enrollment id is required.",
        };
      }

      if (!payload.status) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: "Enrollment status is required.",
        };
      }

      return {
        success: true,
        enrollment: updateEnrollmentStatus(payload.id, payload.status),
      };
    } catch (error) {
      return handleError(error);
    }
  });
}

module.exports = {
  registerEnrollmentsIpc,
};
