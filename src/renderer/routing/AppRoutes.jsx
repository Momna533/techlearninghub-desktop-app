import { Route, Routes } from "react-router-dom";

import RequirePermission from "../authorization/RequirePermission";
import AppShell from "../layout/AppShell";

import { getAllNavItems } from "../navigation/nav-config";

import DashboardPage from "../pages/DashboardPage";
import StudentsPage from "../pages/StudentsPage";
import CoursesPage from "../pages/CoursesPage";
// import BatchesPage from '../pages/BatchesPage';
// import AttendancePage from '../pages/AttendancePage';
// import FeesPage from '../pages/FeesPage';
// import CertificatesPage from '../pages/CertificatesPage';

// import LeadsPage from '../pages/LeadsPage';
// import ClientsPage from '../pages/ClientsPage';
// import ProposalsPage from '../pages/ProposalsPage';
// import ProjectsPage from '../pages/ProjectsPage';
// import TasksPage from '../pages/TasksPage';
// import TeamsPage from '../pages/TeamsPage';
// import SupportPage from '../pages/SupportPage';

// import InvoicesPage from '../pages/InvoicesPage';
// import PaymentsPage from '../pages/PaymentsPage';
// import ExpensesPage from '../pages/ExpensesPage';
// import PayrollPage from '../pages/PayrollPage';

// import EmployeesPage from '../pages/EmployeesPage';
// import UsersPage from '../pages/UsersPage';
// import RolesPage from '../pages/RolesPage';

// import ReportsPage from '../pages/ReportsPage';
// import DocumentsPage from '../pages/DocumentsPage';
// import SettingsPage from '../pages/SettingsPage';

import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const PAGE_COMPONENTS = {
  DashboardPage,

  StudentsPage,
  CoursesPage,
  // BatchesPage,
  // AttendancePage,
  // FeesPage,
  // CertificatesPage,

  // LeadsPage,
  // ClientsPage,
  // ProposalsPage,
  // ProjectsPage,
  // TasksPage,
  // TeamsPage,
  // SupportPage,

  // InvoicesPage,
  // PaymentsPage,
  // ExpensesPage,
  // PayrollPage,

  // EmployeesPage,
  // UsersPage,
  // RolesPage,

  // ReportsPage,
  // DocumentsPage,
  // SettingsPage,
};

function AppRoutes({ user, onLogout }) {
  return (
    <Routes>
      <Route element={<AppShell user={user} onLogout={onLogout} />}>
        {getAllNavItems().map((item) => {
          const PageComponent = PAGE_COMPONENTS[item.page];
          const isIndex = item.path === "/";

          return (
            <Route
              key={item.id}
              index={isIndex || undefined}
              path={isIndex ? undefined : item.path.replace(/^\//, "")}
              element={
                <RequirePermission user={user} permission={item.permission}>
                  <PageComponent user={user} />
                </RequirePermission>
              }
            />
          );
        })}

        <Route path="unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
