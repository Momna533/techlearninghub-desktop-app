import { useEffect, useState } from 'react';
import {
  createTeamMember,
  updateTeamMember,
} from '../../services/team-member.api';
import { listTeams } from '../../services/team.api';
import { listEmployees } from '../../services/employee.api';

const EMPTY_FORM = {
  teamId: '',
  employeeId: '',
  roleInTeam: '',
  joinedAt: '',
  leftAt: '',
};

function normalizeForm(member) {
  if (!member) {
    return EMPTY_FORM;
  }

  return {
    teamId: member.team_id ? String(member.team_id) : '',
    employeeId: member.employee_id
      ? String(member.employee_id)
      : '',
    roleInTeam: member.role_in_team || '',
    joinedAt: member.joined_at || '',
    leftAt: member.left_at || '',
  };
}

export default function TeamMemberForm({
  member = null,
  onSuccess,
  onCancel,
}) {
  const isEditing = Boolean(member);

  const [form, setForm] = useState(
    normalizeForm(member),
  );

  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    setForm(normalizeForm(member));
  }, [member]);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError('');

      try {
        const [teamsResult, employeesResult] =
          await Promise.all([
            listTeams({ status: 'active' }),
            listEmployees({ status: 'active' }),
          ]);

        if (!teamsResult?.success) {
          throw new Error(
            teamsResult?.message ||
              'Failed to load teams.',
          );
        }

        if (!employeesResult?.success) {
          throw new Error(
            employeesResult?.message ||
              'Failed to load employees.',
          );
        }

        setTeams(teamsResult.teams || []);
        setEmployees(employeesResult.employees || []);
      } catch (err) {
        setError(
          err.message ||
            'Failed to load form options.',
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!form.teamId) {
      setError('Please select a team.');
      return;
    }

    if (!form.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (!form.roleInTeam.trim()) {
      setError('Role in team is required.');
      return;
    }

    if (!form.joinedAt) {
      setError('Joined date is required.');
      return;
    }

    if (
      form.leftAt &&
      form.leftAt < form.joinedAt
    ) {
      setError(
        'Left date cannot be before joined date.',
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        teamId: Number(form.teamId),
        employeeId: Number(form.employeeId),
        roleInTeam: form.roleInTeam.trim(),
        joinedAt: form.joinedAt,
        leftAt: form.leftAt || null,
      };

      const result = isEditing
        ? await updateTeamMember(member.id, payload)
        : await createTeamMember(payload);

      if (!result?.success) {
        throw new Error(
          result?.message ||
            `Failed to ${
              isEditing ? 'update' : 'create'
            } team member.`,
        );
      }

      onSuccess?.(result.member);
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${
            isEditing ? 'update' : 'create'
          } team member.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing
              ? 'Edit Team Member'
              : 'Add Team Member'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Assign an employee to a team and define
            their role.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto"
        >
          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Team
              </label>

              <select
                name="teamId"
                value={form.teamId}
                onChange={handleChange}
                disabled={loadingOptions || saving}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">
                  Select team
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.team_code} — {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employee
              </label>

              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                disabled={loadingOptions || saving}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">
                  Select employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.employee_code} —{' '}
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role in Team
              </label>

              <input
                type="text"
                name="roleInTeam"
                value={form.roleInTeam}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Joined Date
              </label>

              <input
                type="date"
                name="joinedAt"
                value={form.joinedAt}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Left Date
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                type="date"
                name="leftAt"
                value={form.leftAt}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </div>
          </div>

          {loadingOptions && (
            <div className="mx-6 mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Loading teams and employees...
            </div>
          )}

          {error && (
            <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving || loadingOptions
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update Team Member'
                  : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}