import { useEffect, useState } from 'react';
import {
  Archive,
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

import {
  archiveTeam,
  deactivateTeam,
  getTeam,
  listTeams,
} from '../services/team.api';

import TeamForm from '../components/teams/TeamForm';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

function getStatusClass(status) {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'inactive') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function getStatusDot(status) {
  if (status === 'active') {
    return 'bg-emerald-500';
  }

  if (status === 'inactive') {
    return 'bg-amber-500';
  }

  return 'bg-slate-400';
}

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  async function loadTeams() {
    setLoading(true);
    setError('');

    try {
      const result = await listTeams({
        search,
        status,
      });

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to load teams.',
        );
      }

      setTeams(result.teams ?? []);
    } catch (err) {
      console.error('[TeamsPage] Failed to load teams:', err);
      setError(err.message || 'Failed to load teams.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, [search, status]);

  function handleAdd() {
    setEditingTeam(null);
    setShowForm(true);
  }

  function handleEdit(team) {
    setEditingTeam(team);
    setShowForm(true);
  }

  async function handleView(team) {
    setLoadingTeam(true);
    setError('');

    try {
      const result = await getTeam(team.id);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to load team.',
        );
      }

      setSelectedTeam(result.team);
    } catch (err) {
      console.error('[TeamsPage] Failed to load team:', err);
      setError(err.message || 'Failed to load team.');
    } finally {
      setLoadingTeam(false);
    }
  }

  async function handleDeactivate(team) {
    const confirmed = window.confirm(
      `Deactivate "${team.name}"?`,
    );

    if (!confirmed) return;

    try {
      const result = await deactivateTeam(team.id);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to deactivate team.',
        );
      }

      await loadTeams();
    } catch (err) {
      console.error(
        '[TeamsPage] Failed to deactivate team:',
        err,
      );

      setError(
        err.message || 'Failed to deactivate team.',
      );
    }
  }

  async function handleArchive(team) {
    const confirmed = window.confirm(
      `Archive "${team.name}"?`,
    );

    if (!confirmed) return;

    try {
      const result = await archiveTeam(team.id);

      if (!result?.success) {
        throw new Error(
          result?.message || 'Failed to archive team.',
        );
      }

      await loadTeams();
    } catch (err) {
      console.error(
        '[TeamsPage] Failed to archive team:',
        err,
      );

      setError(
        err.message || 'Failed to archive team.',
      );
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingTeam(null);
    loadTeams();
  }

  function clearFilters() {
    setSearch('');
    setStatus('all');
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-5 sm:p-6 lg:p-8">

      {/* Page Header */}
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <UsersRound size={21} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Teams
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Organize and manage your software development teams.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Plus size={16} />
            Add Team
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Teams
              </span>

              <BriefcaseBusiness
                size={17}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {teams.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Active
              </span>

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {teams.filter((team) => team.status === 'active').length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Inactive / Archived
              </span>

              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            </div>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {
                teams.filter(
                  (team) =>
                    team.status === 'inactive' ||
                    team.status === 'archived',
                ).length
              }
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by team name, code or lead..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 lg:w-48"
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
          </div>

          {(search || status !== 'all') && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Showing {teams.length}{' '}
                {teams.length === 1 ? 'team' : 'teams'}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

              <p className="mt-4 text-sm text-slate-500">
                Loading teams...
              </p>
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <UsersRound size={27} strokeWidth={1.7} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                No teams found
              </h3>

              <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                {search || status !== 'all'
                  ? 'No teams match your current search or status filter.'
                  : 'Create your first team to start organizing your software development work.'}
              </p>

              {search || status !== 'all' ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus size={15} />
                  Add Team
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Team
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Team Lead
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {teams.map((team) => (
                      <tr
                        key={team.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <BriefcaseBusiness
                                size={17}
                                strokeWidth={1.8}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {team.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {team.team_code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <UserRound size={15} />
                            </div>

                            <span className="text-sm text-slate-700">
                              {team.lead_employee_name || (
                                <span className="text-slate-400">
                                  No team lead
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(team.status)}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getStatusDot(team.status)}`}
                            />

                            {team.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleView(team)
                              }
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(team)
                              }
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            {team.status === 'active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(team)
                                }
                                className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                              >
                                Deactivate
                              </button>
                            )}

                            {team.status !== 'archived' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleArchive(team)
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Archive size={14} />
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 transition hover:bg-slate-50/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <BriefcaseBusiness size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {team.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {team.team_code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${getStatusClass(team.status)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(team.status)}`}
                        />

                        {team.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <UserRound size={15} />

                      {team.lead_employee_name || 'No team lead'}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(team)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(team)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      {team.status === 'active' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(team)
                          }
                          className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
                        >
                          Deactivate
                        </button>
                      )}

                      {team.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleArchive(team)
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Team */}
      {showForm && (
        <TeamForm
          team={editingTeam}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingTeam(null);
          }}
        />
      )}

      {/* View Team Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Team Details
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {selectedTeam.team_code}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            {/* Details */}
            <div className="overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Team Name
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedTeam.name}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Team Code
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedTeam.team_code}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Team Lead
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <UserRound size={14} />
                    </div>

                    <p className="text-sm text-slate-700">
                      {selectedTeam.lead_employee_name || 'No team lead'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(selectedTeam.status)}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(selectedTeam.status)}`}
                      />

                      {selectedTeam.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedTeam.description ||
                      'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Team */}
      {loadingTeam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

            <span className="text-sm font-medium text-slate-700">
              Loading team...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}