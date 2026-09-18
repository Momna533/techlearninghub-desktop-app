const assert = require('node:assert/strict');
const { PERMISSIONS } = require('../../src/domain/authorization/permission-codes');
const { ROLE_DEFINITIONS, ROLES } = require('../../src/domain/authorization/role-definitions');

/**
 * Mirrors renderer nav-config without pulling JSX into Node tests.
 * Keep paths/permissions in sync with src/renderer/navigation/nav-config.js.
 */
const NAV_ITEMS = [
  { path: '/', permission: PERMISSIONS.DASHBOARD_VIEW, label: 'Dashboard' },
  { path: '/academy/students', permission: PERMISSIONS.ACADEMY_STUDENTS_VIEW, label: 'Students' },
  { path: '/academy/courses', permission: PERMISSIONS.ACADEMY_COURSES_VIEW, label: 'Courses' },
  { path: '/academy/batches', permission: PERMISSIONS.ACADEMY_BATCHES_VIEW, label: 'Batches' },
  { path: '/academy/attendance', permission: PERMISSIONS.ACADEMY_ATTENDANCE_VIEW, label: 'Attendance' },
  { path: '/academy/fees', permission: PERMISSIONS.ACADEMY_FEES_VIEW, label: 'Fees' },
  { path: '/academy/certificates', permission: PERMISSIONS.ACADEMY_CERTIFICATES_VIEW, label: 'Certificates' },
  { path: '/software/leads', permission: PERMISSIONS.SOFTWARE_LEADS_VIEW, label: 'Leads' },
  { path: '/software/clients', permission: PERMISSIONS.SOFTWARE_CLIENTS_VIEW, label: 'Clients' },
  { path: '/software/proposals', permission: PERMISSIONS.SOFTWARE_PROPOSALS_VIEW, label: 'Proposals' },
  { path: '/software/projects', permission: PERMISSIONS.SOFTWARE_PROJECTS_VIEW, label: 'Projects' },
  { path: '/software/tasks', permission: PERMISSIONS.SOFTWARE_TASKS_VIEW, label: 'Tasks' },
  { path: '/software/teams', permission: PERMISSIONS.SOFTWARE_TEAMS_VIEW, label: 'Teams' },
  { path: '/software/support', permission: PERMISSIONS.SOFTWARE_SUPPORT_VIEW, label: 'Support' },
  { path: '/finance/invoices', permission: PERMISSIONS.FINANCE_INVOICES_VIEW, label: 'Invoices' },
  { path: '/finance/payments', permission: PERMISSIONS.FINANCE_PAYMENTS_VIEW, label: 'Payments' },
  { path: '/finance/expenses', permission: PERMISSIONS.FINANCE_EXPENSES_VIEW, label: 'Expenses' },
  { path: '/finance/payroll', permission: PERMISSIONS.FINANCE_PAYROLL_VIEW, label: 'Payroll' },
  { path: '/people/employees', permission: PERMISSIONS.PEOPLE_EMPLOYEES_VIEW, label: 'Employees' },
  { path: '/people/users', permission: PERMISSIONS.USERS_VIEW, label: 'Users' },
  { path: '/people/roles', permission: PERMISSIONS.RBAC_MANAGE, label: 'Roles' },
  { path: '/reports', permission: PERMISSIONS.REPORTS_VIEW, label: 'Reports' },
  { path: '/documents', permission: PERMISSIONS.DOCUMENTS_VIEW, label: 'Documents' },
  { path: '/settings', permission: PERMISSIONS.SETTINGS_MANAGE, label: 'Settings' },
];

function rolePermissions(roleCode) {
  const role = ROLE_DEFINITIONS.find((entry) => entry.code === roleCode);
  assert.ok(role, `Missing role ${roleCode}`);
  return new Set(role.permissions);
}

function visibleNav(roleCode) {
  const permissions = rolePermissions(roleCode);
  return NAV_ITEMS.filter((item) => permissions.has(item.permission));
}

function canAccess(roleCode, path) {
  const item = NAV_ITEMS.find((entry) => entry.path === path);
  assert.ok(item, `Missing nav item ${path}`);
  return rolePermissions(roleCode).has(item.permission);
}

function main() {
  assert.equal(NAV_ITEMS.length, 24, 'Shell must expose the full module catalog');

  const superAdminNav = visibleNav(ROLES.SUPER_ADMIN);
  assert.equal(superAdminNav.length, NAV_ITEMS.length);

  const developerNav = visibleNav(ROLES.DEVELOPER).map((item) => item.label);
  assert.deepEqual(developerNav, [
    'Dashboard',
    'Projects',
    'Tasks',
    'Teams',
    'Users',
    'Documents',
  ]);

  assert.equal(canAccess(ROLES.DEVELOPER, '/software/projects'), true);
  assert.equal(canAccess(ROLES.DEVELOPER, '/finance/invoices'), false);
  assert.equal(canAccess(ROLES.DEVELOPER, '/academy/students'), false);

  const hrNav = visibleNav(ROLES.HR).map((item) => item.label);
  assert.deepEqual(hrNav, [
    'Dashboard',
    'Payroll',
    'Employees',
    'Users',
    'Reports',
    'Documents',
  ]);

  assert.equal(canAccess(ROLES.HR, '/people/employees'), true);
  assert.equal(canAccess(ROLES.HR, '/people/roles'), false);
  assert.equal(canAccess(ROLES.HR, '/software/leads'), false);

  console.log('Shell navigation permission checks passed.');
}

main();
