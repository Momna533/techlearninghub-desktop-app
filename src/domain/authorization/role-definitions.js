const { PERMISSIONS } = require("./permission-codes");

/**
 * System roles. Codes are stable identifiers stored in the database.
 * Permissions listed here are synced into role_permissions on bootstrap.
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TRAINER: "trainer",
  PROJECT_MANAGER: "project_manager",
  DEVELOPER: "developer",
  DESIGNER: "designer",
  ACCOUNTANT: "accountant",
  HR: "hr",
});

const ALL_PERMISSION_CODES = Object.freeze(Object.values(PERMISSIONS));

const ACADEMY_VIEW_PERMISSIONS = Object.freeze([
  PERMISSIONS.ACADEMY_STUDENTS_VIEW,
  PERMISSIONS.ACADEMY_COURSES_VIEW,
  PERMISSIONS.ACADEMY_BATCHES_VIEW,
  PERMISSIONS.ACADEMY_ATTENDANCE_VIEW,
  PERMISSIONS.ACADEMY_FEES_VIEW,
  PERMISSIONS.ACADEMY_CERTIFICATES_VIEW,
]);

const ACADEMY_MANAGE_PERMISSIONS = Object.freeze([
  PERMISSIONS.ACADEMY_COURSES_MANAGE,
  PERMISSIONS.ACADEMY_BATCHES_MANAGE,
]);

const SOFTWARE_VIEW_PERMISSIONS = Object.freeze([
  PERMISSIONS.SOFTWARE_LEADS_VIEW,
  PERMISSIONS.SOFTWARE_CLIENTS_VIEW,
  PERMISSIONS.SOFTWARE_PROPOSALS_VIEW,
  PERMISSIONS.SOFTWARE_PROJECTS_VIEW,
  PERMISSIONS.SOFTWARE_TASKS_VIEW,
  PERMISSIONS.SOFTWARE_TEAMS_VIEW,
  PERMISSIONS.SOFTWARE_SUPPORT_VIEW,
]);

const FINANCE_VIEW_PERMISSIONS = Object.freeze([
  PERMISSIONS.FINANCE_INVOICES_VIEW,
  PERMISSIONS.FINANCE_PAYMENTS_VIEW,
  PERMISSIONS.FINANCE_EXPENSES_VIEW,
  PERMISSIONS.FINANCE_PAYROLL_VIEW,
]);

const ROLE_DEFINITIONS = Object.freeze([
  {
    code: ROLES.SUPER_ADMIN,
    name: "Super Admin",
    description: "Full system access, including RBAC administration.",
    isSystemRole: true,
    permissions: [...ALL_PERMISSION_CODES],
  },
  {
    code: ROLES.ADMIN,
    name: "Admin",
    description:
      "Operational administrator without exclusive super-admin-only expansion later.",
    isSystemRole: true,
    permissions: [...ALL_PERMISSION_CODES],
  },
  {
    code: ROLES.TRAINER,
    name: "Trainer",
    description: "Training academy instructor.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      ...ACADEMY_VIEW_PERMISSIONS,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  {
    code: ROLES.PROJECT_MANAGER,
    name: "Project Manager",
    description: "Software house project leadership.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      ...SOFTWARE_VIEW_PERMISSIONS,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.DEMO_ADMIN_ACTION,
    ],
  },
  {
    code: ROLES.DEVELOPER,
    name: "Developer",
    description: "Software house developer.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.SOFTWARE_PROJECTS_VIEW,
      PERMISSIONS.SOFTWARE_TASKS_VIEW,
      PERMISSIONS.SOFTWARE_TEAMS_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW,
    ],
  },
  {
    code: ROLES.DESIGNER,
    name: "Designer",
    description: "Software house designer.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.SOFTWARE_PROJECTS_VIEW,
      PERMISSIONS.SOFTWARE_TASKS_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW,
    ],
  },
  {
    code: ROLES.ACCOUNTANT,
    name: "Accountant",
    description: "Finance and billing access.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      ...FINANCE_VIEW_PERMISSIONS,
      PERMISSIONS.ACADEMY_FEES_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.DEMO_FINANCE_ACTION,
    ],
  },
  {
    code: ROLES.HR,
    name: "HR",
    description: "Human resources access.",
    isSystemRole: true,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
      PERMISSIONS.FINANCE_PAYROLL_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.DEMO_HR_ACTION,
    ],
  },
]);

module.exports = {
  ROLES,
  ROLE_DEFINITIONS,
  ALL_PERMISSION_CODES,
  ACADEMY_VIEW_PERMISSIONS,
  ACADEMY_MANAGE_PERMISSIONS,
  SOFTWARE_VIEW_PERMISSIONS,
  FINANCE_VIEW_PERMISSIONS,
};
