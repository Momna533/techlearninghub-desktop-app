import { useEffect, useState } from 'react';
import {
  Archive,
  Eye,
  Pencil,
  Plus,
  Search,
  UserRound,
  X,
} from 'lucide-react';

import {
  deactivateEmployee,
  getEmployee,
  listEmployees,
} from '../services/employee.api';

import EmployeeForm from '../components/employees/EmployeeForm';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
];

function getStatusClass(status) {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'on_leave') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (status === 'terminated') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function getStatusDot(status) {
  if (status === 'active') {
    return 'bg-emerald-500';
  }

  if (status === 'on_leave') {
    return 'bg-amber-500';
  }

  if (status === 'terminated') {
    return 'bg-red-500';
  }

  return 'bg-slate-400';
}

function formatStatus(status) {
  if (status === 'on_leave') {
    return 'On Leave';
  }

  if (status === 'active') {
    return 'Active';
  }

  if (status === 'inactive') {
    return 'Inactive';
  }

  if (status === 'terminated') {
    return 'Terminated';
  }

  return status;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    setError('');

    try {
      const result = await listEmployees({
        search,
        status,
      });

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to load employees.',
        );
      }

      setEmployees(result.employees ?? []);
    } catch (err) {
      console.error(
        '[EmployeesPage] Failed to load employees:',
        err,
      );

      setError(
        err.message || 'Failed to load employees.',
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [search, status]);

  function handleAdd() {
    setEditingEmployee(null);
    setShowForm(true);
  }

  function handleEdit(employee) {
    setEditingEmployee(employee);
    setShowForm(true);
  }

  async function handleView(employee) {
    setLoadingEmployee(true);
    setError('');

    try {
      const result = await getEmployee(employee.id);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to load employee.',
        );
      }

      setSelectedEmployee(result.employee);
    } catch (err) {
      console.error(
        '[EmployeesPage] Failed to load employee:',
        err,
      );

      setError(
        err.message || 'Failed to load employee.',
      );
    } finally {
      setLoadingEmployee(false);
    }
  }

  async function handleDeactivate(employee) {
    const confirmed = window.confirm(
      `Deactivate "${employee.full_name}"?`,
    );

    if (!confirmed) return;

    try {
      const result = await deactivateEmployee(
        employee.id,
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Failed to deactivate employee.',
        );
      }

      await loadEmployees();
    } catch (err) {
      console.error(
        '[EmployeesPage] Failed to deactivate employee:',
        err,
      );

      setError(
        err.message ||
          'Failed to deactivate employee.',
      );
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingEmployee(null);
    loadEmployees();
  }

  function clearFilters() {
    setSearch('');
    setStatus('all');
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (employee) =>
      employee.employment_status === 'active',
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) =>
      employee.employment_status === 'on_leave',
  ).length;

  return (
    <div className="min-h-full bg-slate-50/50 p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <UserRound size={22} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Employees
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {totalEmployees}{' '}
                {totalEmployees === 1
                  ? 'employee'
                  : 'employees'}{' '}
                in your software house
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Add Employee
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Employees
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalEmployees}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {activeEmployees}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              On Leave
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {onLeaveEmployees}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, code, phone, email, job title or department..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {(search || status !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 transition hover:text-red-600"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading employees...
                </p>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserRound size={25} />
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">
                No employees
              </h2>

              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {search || status !== 'all'
                  ? 'No employees match your current filters.'
                  : 'Create your first employee to start managing your software house team.'}
              </p>

              {search || status !== 'all' ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Add Employee
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Employee
                      </th>

                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Position
                      </th>

                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <UserRound size={17} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {employee.full_name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {employee.employee_code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-800">
                            {employee.job_title || '—'}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {employee.department || 'No department'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {employee.email || '—'}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {employee.phone || 'No phone'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              employee.employment_status,
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                employee.employment_status,
                              )}`}
                            />

                            {formatStatus(
                              employee.employment_status,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleView(employee)
                              }
                              title="View"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(employee)
                              }
                              title="Edit"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Pencil size={17} />
                            </button>

                            {employee.employment_status ===
                              'active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    employee,
                                  )
                                }
                                title="Deactivate"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                              >
                                <Archive size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {employee.full_name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {employee.employee_code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          employee.employment_status,
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            employee.employment_status,
                          )}`}
                        />

                        {formatStatus(
                          employee.employment_status,
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">
                          Job Title
                        </p>

                        <p className="mt-1 text-slate-700">
                          {employee.job_title || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 text-slate-700">
                          {employee.department || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 truncate text-slate-700">
                          {employee.email || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 text-slate-700">
                          {employee.phone || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleView(employee)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(employee)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Pencil size={17} />
                      </button>

                      {employee.employment_status ===
                        'active' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(
                              employee,
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Archive size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {showForm && (
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          />
        )}

        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Employee Details
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedEmployee.employee_code}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedEmployee(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedEmployee.full_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      selectedEmployee.employment_status,
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                        selectedEmployee.employment_status,
                      )}`}
                    />

                    {formatStatus(
                      selectedEmployee.employment_status,
                    )}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Job Title
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.job_title || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.department || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.email || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.phone || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Hire Date
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.hire_date || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Termination Date
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.termination_date || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Currency
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.currency_code || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Base Salary
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedEmployee.base_salary_minor ??
                      '—'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEmployee(null)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {loadingEmployee && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 backdrop-blur-[1px]">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

                <span className="text-sm font-medium text-slate-700">
                  Loading employee...
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}