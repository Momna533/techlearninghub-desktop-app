const { PERMISSIONS } = require('./permission-codes');

/**
 * System roles. Codes are stable identifiers stored in the database.
 * Permissions listed here are synced into role_permissions on bootstrap.
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TRAINER: 'trainer',
  PROJECT_MANAGER: 'project_manager',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  ACCOUNTANT: 'accountant',
  HR: 'hr',
});

const ALL_PERMISSION_CODES = Object.freeze(Object.values(PERMISSIONS));

const ROLE_DEFINITIONS = Object.freeze([
  {
    code: ROLES.SUPER_ADMIN,
    name: 'Super Admin',
    description: 'Full system access, including RBAC administration.',
    isSystemRole: true,
    permissions: [...ALL_PERMISSION_CODES],
  },
  {
    code: ROLES.ADMIN,
    name: 'Admin',
    description: 'Operational administrator without exclusive super-admin-only expansion later.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.DEMO_ADMIN_ACTION,
      PERMISSIONS.DEMO_HR_ACTION,
      PERMISSIONS.DEMO_FINANCE_ACTION,
    ],
  },
  {
    code: ROLES.TRAINER,
    name: 'Trainer',
    description: 'Training academy instructor.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
    ],
  },
  {
    code: ROLES.PROJECT_MANAGER,
    name: 'Project Manager',
    description: 'Software house project leadership.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.DEMO_ADMIN_ACTION,
    ],
  },
  {
    code: ROLES.DEVELOPER,
    name: 'Developer',
    description: 'Software house developer.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
    ],
  },
  {
    code: ROLES.DESIGNER,
    name: 'Designer',
    description: 'Software house designer.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
    ],
  },
  {
    code: ROLES.ACCOUNTANT,
    name: 'Accountant',
    description: 'Finance and billing access.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.DEMO_FINANCE_ACTION,
    ],
  },
  {
    code: ROLES.HR,
    name: 'HR',
    description: 'Human resources access.',
    isSystemRole: true,
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.DEMO_HR_ACTION,
    ],
  },
]);

module.exports = {
  ROLES,
  ROLE_DEFINITIONS,
  ALL_PERMISSION_CODES,
};
