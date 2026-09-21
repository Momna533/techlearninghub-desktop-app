const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');
const {
  requirePermission,
} = require('../../src/application/services/authorization.service');

const {
  createPayment,
  getPaymentHistory,
  getPaymentSummary,
  getPaymentById,
} = require('../../src/application/services/student-payment.service');

function registerStudentPaymentIpc({ ipcMain }) {
  ipcMain.handle('student-payments:create', (_event, payment) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        payment: createPayment(payment ?? {}),
      };
    } catch (error) {
      console.error('[student-payments:create]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_PAYMENT_CREATE_FAILED',
        message: error.message || 'Failed to create payment.',
        details: error.details || null,
      };
    }
  });

  ipcMain.handle('student-payments:list', (_event, enrollmentId) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        payments: getPaymentHistory(enrollmentId),
      };
    } catch (error) {
      console.error('[student-payments:list]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_PAYMENTS_LIST_FAILED',
        message: error.message || 'Failed to load payment history.',
      };
    }
  });

  ipcMain.handle('student-payments:summary', (_event, enrollmentId) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        summary: getPaymentSummary(enrollmentId),
      };
    } catch (error) {
      console.error('[student-payments:summary]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_PAYMENT_SUMMARY_FAILED',
        message: error.message || 'Failed to load payment summary.',
      };
    }
  });

  ipcMain.handle('student-payments:get', (_event, id) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_STUDENTS_VIEW);

    if (denial) return denial;

    try {
      return {
        success: true,
        payment: getPaymentById(id),
      };
    } catch (error) {
      console.error('[student-payments:get]', error);

      return {
        success: false,
        code: error.code || 'STUDENT_PAYMENT_GET_FAILED',
        message: error.message || 'Failed to load payment.',
      };
    }
  });
}

module.exports = {
  registerStudentPaymentIpc,
};