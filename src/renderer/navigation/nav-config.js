import { PERMISSIONS } from '../authorization/permissions';

export const NAV_SECTIONS = Object.freeze([
  {
    id: 'main',
    label: null,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        page: 'DashboardPage',
        permission: PERMISSIONS.DASHBOARD_VIEW,
        icon: 'LayoutDashboard',
      },
    ],
  },

  {
    id: 'academy',
    label: 'Academy',
    items: [
      {
        id: 'students',
        label: 'Students',
        path: '/academy/students',
        page: 'StudentsPage',
        permission: PERMISSIONS.ACADEMY_STUDENTS_VIEW,
        icon: 'GraduationCap',
      },
      {
        id: 'courses',
        label: 'Courses',
        path: '/academy/courses',
        page: 'CoursesPage',
        permission: PERMISSIONS.ACADEMY_COURSES_VIEW,
        icon: 'BookOpen',
      },
      {
        id: 'batches',
        label: 'Batches',
        path: '/academy/batches',
        page: 'BatchesPage',
        permission: PERMISSIONS.ACADEMY_BATCHES_VIEW,
        icon: 'Layers',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        path: '/academy/attendance',
        page: 'AttendancePage',
        permission: PERMISSIONS.ACADEMY_ATTENDANCE_VIEW,
        icon: 'ClipboardCheck',
      },
      {
        id: 'fees',
        label: 'Fees',
        path: '/academy/fees',
        page: 'FeesPage',
        permission: PERMISSIONS.ACADEMY_FEES_VIEW,
        icon: 'Wallet',
      },
    ],
  },

  {
    id: 'software-house',
    label: 'Software House',
    items: [
      {
        id: 'leads',
        label: 'Leads',
        path: '/software/leads',
        page: 'LeadsPage',
        permission: PERMISSIONS.SOFTWARE_LEADS_VIEW,
        icon: 'UserPlus',
      },
      {
        id: 'clients',
        label: 'Clients',
        path: '/software/clients',
        page: 'ClientsPage',
        permission: PERMISSIONS.SOFTWARE_CLIENTS_VIEW,
        icon: 'Users',
      },
      {
        id: 'proposals',
        label: 'Proposals',
        path: '/software/proposals',
        page: 'ProposalsPage',
        permission: PERMISSIONS.SOFTWARE_PROPOSALS_VIEW,
        icon: 'FileText',
      },
      {
        id: 'projects',
        label: 'Projects',
        path: '/software/projects',
        page: 'ProjectsPage',
        permission: PERMISSIONS.SOFTWARE_PROJECTS_VIEW,
        icon: 'FolderKanban',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        path: '/software/tasks',
        page: 'TasksPage',
        permission: PERMISSIONS.SOFTWARE_TASKS_VIEW,
        icon: 'SquareCheckBig',
      },
      {
        id: 'teams',
        label: 'Teams',
        path: '/software/teams',
        page: 'TeamsPage',
        permission: PERMISSIONS.SOFTWARE_TEAMS_VIEW,
        icon: 'UserCog',
      },
      {
        id: 'support',
        label: 'Support',
        path: '/software/support',
        page: 'SupportPage',
        permission: PERMISSIONS.SOFTWARE_SUPPORT_VIEW,
        icon: 'LifeBuoy',
      },
    ],
  },

  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        id: 'invoices',
        label: 'Invoices',
        path: '/finance/invoices',
        page: 'InvoicesPage',
        permission: PERMISSIONS.FINANCE_INVOICES_VIEW,
        icon: 'Receipt',
      },
      {
        id: 'payments',
        label: 'Payments',
        path: '/finance/payments',
        page: 'PaymentsPage',
        permission: PERMISSIONS.FINANCE_PAYMENTS_VIEW,
        icon: 'CreditCard',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        path: '/finance/expenses',
        page: 'ExpensesPage',
        permission: PERMISSIONS.FINANCE_EXPENSES_VIEW,
        icon: 'ReceiptText',
      },
      {
        id: 'payroll',
        label: 'Payroll',
        path: '/finance/payroll',
        page: 'PayrollPage',
        permission: PERMISSIONS.FINANCE_PAYROLL_VIEW,
        icon: 'Banknote',
      },
    ],
  },

  {
    id: 'people',
    label: 'People',
    items: [
      {
        id: 'employees',
        label: 'Employees',
        path: '/people/employees',
        page: 'EmployeesPage',
        permission: PERMISSIONS.PEOPLE_EMPLOYEES_VIEW,
        icon: 'BriefcaseBusiness',
      },
      {
        id: 'users',
        label: 'Users',
        path: '/people/users',
        page: 'UsersPage',
        permission: PERMISSIONS.USERS_VIEW,
        icon: 'UserRoundCog',
      },
      {
        id: 'roles',
        label: 'Roles',
        path: '/people/roles',
        page: 'RolesPage',
        permission: PERMISSIONS.RBAC_MANAGE,
        icon: 'ShieldCheck',
      },
    ],
  },

  {
    id: 'system',
    label: null,
    items: [
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        page: 'ReportsPage',
        permission: PERMISSIONS.REPORTS_VIEW,
        icon: 'ChartColumn',
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        page: 'SettingsPage',
        permission: PERMISSIONS.SETTINGS_MANAGE,
        icon: 'Settings',
      },
    ],
  },
]);

export function getAllNavItems() {
  return NAV_SECTIONS.flatMap((section) => section.items);
}

export function findNavItemByPath(pathname) {
  const normalized = pathname === '' ? '/' : pathname;

  return (
    getAllNavItems().find((item) => item.path === normalized) ?? null
  );
}