const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');
const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deactivateStudent,
} = require('../../src/application/services/student.service');

function registerStudentIpc({ ipcMain }) {
  ipcMain.handle('students:list', (_event, filters) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        students: getStudents(filters ?? {}),
      };
    } catch (error) {
      console.error('[students:list]', error);

      return {
        success: false,
        code: error.code || 'STUDENTS_LIST_FAILED',
        message: error.message || 'Failed to load students.',
      };
    }
  });

  ipcMain.handle('students:get', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        student: getStudent(id),
      };
    } catch (error) {
      console.error('[students:get]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_GET_FAILED',
        message: error.message || 'Failed to load student.',
      };
    }
  });

  ipcMain.handle('students:create', (_event, student) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        student: createStudent(student ?? {}),
      };
    } catch (error) {
      console.error('[students:create]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_CREATE_FAILED',
        message: error.message || 'Failed to create student.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('students:update', (_event, payload) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      const { id, student } = payload ?? {};

      return {
        success: true,
        student: updateStudent(id, student ?? {}),
      };
    } catch (error) {
      console.error('[students:update]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_UPDATE_FAILED',
        message: error.message || 'Failed to update student.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('students:deactivate', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        student: deactivateStudent(id),
      };
    } catch (error) {
      console.error('[students:deactivate]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_DEACTIVATE_FAILED',
        message: error.message || 'Failed to deactivate student.',
      };
    }
  });
}

module.exports = {
  registerStudentIpc,
};