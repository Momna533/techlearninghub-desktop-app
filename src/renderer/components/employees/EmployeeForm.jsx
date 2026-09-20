import { useState } from 'react';
import {
  CircleAlert,
  UserRound,
  X,
} from 'lucide-react';

import {
  createEmployee,
  updateEmployee,
} from '../../services/employee.api';

const EMPTY_FORM = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  employmentStatus: 'active',
  hireDate: '',
  terminationDate: '',
  baseSalaryMinor: '',
  currencyCode: '',
};

export default function EmployeeForm({
  employee = null,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState(
    employee
      ? {
          employeeCode: employee.employee_code ?? '',
          firstName: employee.first_name ?? '',
          lastName: employee.last_name ?? '',
          email: employee.email ?? '',
          phone: employee.phone ?? '',
          jobTitle: employee.job_title ?? '',
          department: employee.department ?? '',
          employmentStatus:
            employee.employment_status ?? 'active',
          hireDate: employee.hire_date ?? '',
          terminationDate: employee.termination_date ?? '',
          baseSalaryMinor:
            employee.base_salary_minor ?? '',
          currencyCode: employee.currency_code ?? '',
        }
      : EMPTY_FORM,
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(employee);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!form.employeeCode.trim()) {
      setError('Employee code is required.');
      return;
    }

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!form.lastName.trim()) {
      setError('Last name is required.');
      return;
    }

    if (!form.hireDate) {
      setError('Hire date is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        employeeCode: form.employeeCode.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
        department: form.department.trim(),
        employmentStatus: form.employmentStatus,
        hireDate: form.hireDate,
        terminationDate: form.terminationDate || null,
        baseSalaryMinor: form.baseSalaryMinor
          ? Number(form.baseSalaryMinor)
          : null,
        currencyCode: form.currencyCode.trim() || null,
      };

      const result = isEditing
        ? await updateEmployee(employee.id, payload)
        : await createEmployee(payload);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to save employee.',
        );
      }

      onSuccess?.(result.employee);
    } catch (err) {
      console.error('[EmployeeForm]', err);
      setError(
        err.message || 'Failed to save employee.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <UserRound size={21} strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {isEditing
                  ? 'Edit Employee'
                  : 'Create Employee'}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {isEditing
                  ? 'Update the employee information.'
                  : 'Add a new employee to your software house.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6">

            <div className="mb-7">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Personal information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Basic information used to identify the employee.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Employee Code
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    name="employeeCode"
                    value={form.employeeCode}
                    onChange={handleChange}
                    placeholder="EMP-001"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Must be unique.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    First Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Last Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03XX-XXXXXXX"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

              </div>
            </div>

            <div className="mb-7">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Employment information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Define the employee's position and employment status.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Job Title
                  </label>

                  <input
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Development"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Employment Status
                  </label>

                  <select
                    name="employmentStatus"
                    value={form.employmentStatus}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Hire Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="hireDate"
                    value={form.hireDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Termination Date
                  </label>

                  <input
                    type="date"
                    name="terminationDate"
                    value={form.terminationDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Compensation
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Optional salary information. Salary is stored in minor currency units.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Base Salary
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="baseSalaryMinor"
                    value={form.baseSalaryMinor}
                    onChange={handleChange}
                    placeholder="5000000"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Example: 5000000 = Rs. 50,000.00 if using PKR minor units.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Currency Code
                  </label>

                  <input
                    name="currencyCode"
                    value={form.currencyCode}
                    onChange={handleChange}
                    placeholder="PKR"
                    maxLength={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-medium text-red-800">
                    Unable to save employee
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}