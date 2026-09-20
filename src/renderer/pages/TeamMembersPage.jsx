import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Search,
  UserMinus,
  Users,
  X,
} from 'lucide-react';

import {
  getTeamMember,
  listTeamMembers,
  removeTeamMember,
} from '../services/team-member.api';

import { listTeams } from '../services/team.api';

import TeamMemberForm from '../components/team-members/TeamMemberForm';

const EMPTY_SUMMARY = {
  total: 0,
  active: 0,
  inactive: 0,
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function StatusBadge({ status }) {
  const active = status === 'active';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState('all');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState(null);

  const [viewingMember, setViewingMember] =
    useState(null);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [membersResult, teamsResult] =
        await Promise.all([
          listTeamMembers({
            search,
            teamId,
          }),
          listTeams({
            status: 'active',
          }),
        ]);

      if (!membersResult?.success) {
        throw new Error(
          membersResult?.message ||
            'Failed to load team members.',
        );
      }

      if (!teamsResult?.success) {
        throw new Error(
          teamsResult?.message ||
            'Failed to load teams.',
        );
      }

      setMembers(membersResult.members || []);
      setTeams(teamsResult.teams || []);
    } catch (err) {
      setError(
        err.message ||
          'Failed to load team members.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, teamId]);

  const summary = useMemo(() => {
    return members.reduce(
      (result, member) => {
        result.total += 1;

        if (member.membership_status === 'active') {
          result.active += 1;
        } else {
          result.inactive += 1;
        }

        return result;
      },
      { ...EMPTY_SUMMARY },
    );
  }, [members]);

  function openCreateForm() {
    setEditingMember(null);
    setShowForm(true);
  }

  function openEditForm(member) {
    setEditingMember(member);
    setShowForm(true);
  }

  async function openDetails(member) {
    setActionLoading(true);
    setError('');

    try {
      const result = await getTeamMember(
        member.id,
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Failed to load team member.',
        );
      }

      setViewingMember(result.member);
    } catch (err) {
      setError(
        err.message ||
          'Failed to load team member.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemove(member) {
    const confirmed = window.confirm(
      `Remove ${member.employee_name} from ${member.team_name}?`,
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError('');

    try {
      const result = await removeTeamMember(
        member.id,
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Failed to remove team member.',
        );
      }

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          'Failed to remove team member.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingMember(null);
    loadData();
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Team Members
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage employee membership across
              company teams.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Team Member
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Memberships"
            value={summary.total}
            icon={Users}
          />

          <SummaryCard
            label="Active"
            value={summary.active}
            icon={Users}
          />

          <SummaryCard
            label="Inactive"
            value={summary.inactive}
            icon={UserMinus}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search team, employee, role..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <select
              value={teamId}
              onChange={(event) =>
                setTeamId(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">
                All Teams
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
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-sm text-slate-500">
                Loading team members...
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-500">
                <Users size={28} />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                No team members found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add an employee to a team to start
                building your team structure.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Employee
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Team
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Joined
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {member.employee_name}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {member.employee_code}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {member.team_name}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {member.team_code}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {member.role_in_team}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            member.joined_at,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              member.membership_status
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(member)
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(member)
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            {member.membership_status ===
                              'active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(
                                    member,
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                title="Remove"
                              >
                                <UserMinus
                                  size={16}
                                />
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
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.employee_name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {member.employee_code}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          member.membership_status
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">
                          Team
                        </p>

                        <p className="mt-1 text-slate-700">
                          {member.team_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Role
                        </p>

                        <p className="mt-1 text-slate-700">
                          {member.role_in_team}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Joined
                        </p>

                        <p className="mt-1 text-slate-700">
                          {formatDate(
                            member.joined_at,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Left
                        </p>

                        <p className="mt-1 text-slate-700">
                          {formatDate(
                            member.left_at,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDetails(member)
                        }
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(member)
                        }
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        Edit
                      </button>

                      {member.membership_status ===
                        'active' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(member)
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                        >
                          Remove
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

      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Team Member Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Membership information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewingMember(null)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Employee
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {viewingMember.employee_name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {viewingMember.employee_code}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Team
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {viewingMember.team_name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {viewingMember.team_code}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role in Team
                </p>

                <p className="mt-1 text-slate-700">
                  {viewingMember.role_in_team}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Employee Job Title
                </p>

                <p className="mt-1 text-slate-700">
                  {viewingMember.employee_job_title ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Joined Date
                </p>

                <p className="mt-1 text-slate-700">
                  {formatDate(
                    viewingMember.joined_at,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Left Date
                </p>

                <p className="mt-1 text-slate-700">
                  {formatDate(
                    viewingMember.left_at,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-words text-slate-700">
                  {viewingMember.employee_email ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-slate-700">
                  {viewingMember.employee_phone ||
                    '—'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Membership Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      viewingMember.membership_status
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setViewingMember(null)
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {actionLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]">
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-xl">
            Processing...
          </div>
        </div>
      )}
    </div>
  );
}