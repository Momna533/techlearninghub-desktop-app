const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deactivateCourse,
} = require("../../src/application/services/courses.service");

const {
  requirePermission,
} = require("../../src/application/services/authorization.service");

const {
  PERMISSIONS,
} = require("../../src/domain/authorization/permission-codes");

function handleError(error) {
  console.error("Courses IPC error:", error);

  return {
    success: false,
    code: error.code || "COURSE_OPERATION_FAILED",
    message: error.message || "Course operation failed.",
    details: error.details || null,
  };
}

function registerCoursesIpc({ ipcMain }) {
  ipcMain.handle("courses:list", async (_event, filters = {}) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_COURSES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        courses: getCourses(filters),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("courses:get", async (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_COURSES_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        course: getCourse(id),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("courses:create", async (_event, course) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_COURSES_MANAGE);

    if (denial) return denial;

    try {
      return {
        success: true,
        course: createCourse(course),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("courses:update", async (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_COURSES_MANAGE);

    if (denial) return denial;

    try {
      if (!payload || !payload.id) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: "Course id is required.",
        };
      }

      return {
        success: true,
        course: updateCourse(payload.id, payload.course),
      };
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("courses:deactivate", async (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_COURSES_MANAGE);

    if (denial) return denial;

    try {
      return {
        success: true,
        course: deactivateCourse(id),
      };
    } catch (error) {
      return handleError(error);
    }
  });
}

module.exports = {
  registerCoursesIpc,
};
