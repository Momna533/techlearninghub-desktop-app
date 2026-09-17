/**
 * Canonical permission codes.
 * Backend authorization and frontend visibility both reference these constants.
 * Module-specific permissions can be added here later without changing the check machinery.
 */
const PERMISSIONS = Object.freeze({
  RBAC_MANAGE: 'rbac.manage',
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  SETTINGS_MANAGE: 'settings.manage',

  // Architecture demo permissions — prove authorize / deny / UI hide without full modules yet.
  DEMO_ADMIN_ACTION: 'demo.admin_action',
  DEMO_HR_ACTION: 'demo.hr_action',
  DEMO_FINANCE_ACTION: 'demo.finance_action',
});

const PERMISSION_DEFINITIONS = Object.freeze([
  {
    code: PERMISSIONS.RBAC_MANAGE,
    name: 'Manage RBAC',
    description: 'Assign and revoke roles for users.',
  },
  {
    code: PERMISSIONS.USERS_VIEW,
    name: 'View users',
    description: 'View user accounts.',
  },
  {
    code: PERMISSIONS.USERS_MANAGE,
    name: 'Manage users',
    description: 'Create and update user accounts.',
  },
  {
    code: PERMISSIONS.SETTINGS_MANAGE,
    name: 'Manage settings',
    description: 'Change system settings.',
  },
  {
    code: PERMISSIONS.DEMO_ADMIN_ACTION,
    name: 'Demo admin action',
    description: 'Protected demo operation reserved for admins.',
  },
  {
    code: PERMISSIONS.DEMO_HR_ACTION,
    name: 'Demo HR action',
    description: 'Protected demo operation reserved for HR.',
  },
  {
    code: PERMISSIONS.DEMO_FINANCE_ACTION,
    name: 'Demo finance action',
    description: 'Protected demo operation reserved for finance roles.',
  },
]);

export  {
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
};
