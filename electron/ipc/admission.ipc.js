import { createAdmission } from "../../src/application/services/admission.service.js";

import { requirePermission } from "../../src/application/services/authorization.service.js";

import { PERMISSIONS } from "../../src/domain/authorization/permission-codes.js";

function handleError(error) {
  console.error("Admission IPC error:", error);

  return {
    success: false,
    code: error.code || "ADMISSION_OPERATION_FAILED",
    message: error.message || "Admission operation failed.",
    details: error.details || null,
  };
}

export function registerAdmissionIpc({ ipcMain }) {
  ipcMain.handle("admissions:create", async (_event, admission) => {
    const denial = requirePermission(PERMISSIONS.ACADEMY_ENROLLMENTS_MANAGE);

    if (denial) return denial;

    try {
      return {
        success: true,
        ...createAdmission(admission),
      };
    } catch (error) {
      return handleError(error);
    }
  });
}
