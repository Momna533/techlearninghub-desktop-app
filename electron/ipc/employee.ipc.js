const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');

const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  listEmployees,
  getEmployeeById,
  createNewEmployee,
  updateExistingEmployee,
  deactivateExistingEmployee,
} = require('../../src/application/services/employee.service');

function registerEmployeeIpc({ ipcMain }) {
  ipcMain.handle('employees:list', (_event, filters) => {
    const denial = requirePermission(
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        employees: listEmployees(filters ?? {}),
      };
    } catch (error) {
      console.error('[employees:list]', error);

      return {
        success: false,
        code: error.code || 'EMPLOYEES_LIST_FAILED',
        message: error.message || 'Failed to load employees.',
      };
    }
  });

  ipcMain.handle('employees:get', (_event, id) => {
    const denial = requirePermission(
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        employee: getEmployeeById(id),
      };
    } catch (error) {
      console.error('[employees:get]', error);

      return {
        success: false,
        code: error.code || 'EMPLOYEE_GET_FAILED',
        message: error.message || 'Failed to load employee.',
      };
    }
  });

  ipcMain.handle('employees:create', (_event, employee) => {
    const denial = requirePermission(
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        employee: createNewEmployee(employee ?? {}),
      };
    } catch (error) {
      console.error('[employees:create]', error);

      return {
        success: false,
        code: error.code || 'EMPLOYEE_CREATE_FAILED',
        message: error.message || 'Failed to create employee.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('employees:update', (_event, payload) => {
    const denial = requirePermission(
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
    );

    if (denial) return denial;

    try {
      const { id, employee } = payload ?? {};

      return {
        success: true,
        employee: updateExistingEmployee(id, employee ?? {}),
      };
    } catch (error) {
      console.error('[employees:update]', error);

      return {
        success: false,
        code: error.code || 'EMPLOYEE_UPDATE_FAILED',
        message: error.message || 'Failed to update employee.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('employees:deactivate', (_event, id) => {
    const denial = requirePermission(
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
    );

    if (denial) return denial;

    try {
      return {
        success: true,
        employee: deactivateExistingEmployee(id),
      };
    } catch (error) {
      console.error('[employees:deactivate]', error);

      return {
        success: false,
        code: error.code || 'EMPLOYEE_DEACTIVATE_FAILED',
        message:
          error.message || 'Failed to deactivate employee.',
      };
    }
  });
}

module.exports = {
  registerEmployeeIpc,
};