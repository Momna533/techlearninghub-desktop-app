import { useState } from 'react';
import {
  BriefcaseBusiness,
  CircleAlert,
  X,
} from 'lucide-react';

import {
  createTeam,
  updateTeam,
} from '../../services/team.api';

const EMPTY_FORM = {
  teamCode: '',
  name: '',
  leadEmployeeId: '',
  description: '',
  status: 'active',
};

export default function TeamForm({
  team = null,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState(
    team
      ? {
          teamCode: team.team_code ?? '',
          name: team.name ?? '',
          leadEmployeeId: team.lead_employee_id ?? '',
          description: team.description ?? '',
          status: team.status ?? 'active',
        }
      : EMPTY_FORM,
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(team);

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

    if (!form.teamCode.trim()) {
      setError('Team code is required.');
      return;
    }

    if (!form.name.trim()) {
      setError('Team name is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        teamCode: form.teamCode.trim(),
        name: form.name.trim(),
        leadEmployeeId: form.leadEmployeeId
          ? Number(form.leadEmployeeId)
          : null,
        description: form.description.trim(),
        status: form.status,
      };

      const result = isEditing
        ? await updateTeam(team.id, payload)
        : await createTeam(payload);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to save team.',
        );
      }

      onSuccess?.(result.team);
    } catch (err) {
      console.error('[TeamForm]', err);
      setError(err.message || 'Failed to save team.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BriefcaseBusiness size={21} strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {isEditing ? 'Edit Team' : 'Create Team'}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {isEditing
                  ? 'Update the team details and configuration.'
                  : 'Set up a new team for your software house.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6">

            {/* Section */}
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Team information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter the basic information used to identify and manage this team.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Team Code */}
                <div>
                  <label
                    htmlFor="teamCode"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Team Code
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="teamCode"
                    name="teamCode"
                    value={form.teamCode}
                    onChange={handleChange}
                    placeholder="e.g. WEB-01"
                    disabled={saving}
                    autoFocus={!isEditing}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Must be unique.
                  </p>
                </div>

                {/* Team Name */}
                <div>
                  <label
                    htmlFor="teamName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Team Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="teamName"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Web Development Team"
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Team Lead */}
                <div>
                  <label
                    htmlFor="leadEmployeeId"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Team Lead Employee ID
                  </label>

                  <input
                    id="leadEmployeeId"
                    name="leadEmployeeId"
                    type="number"
                    min="1"
                    value={form.leadEmployeeId}
                    onChange={handleChange}
                    placeholder="Optional"
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    Employee selection will become a dropdown when the Employees module is added.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="teamStatus"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="teamStatus"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Description
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add context about the team's responsibilities or area of work.
                </p>
              </div>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Responsible for client websites, frontend development and maintenance..."
                disabled={saving}
                rows={5}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <CircleAlert
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-medium text-red-800">
                    Unable to save team
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
