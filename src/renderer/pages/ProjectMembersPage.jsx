import { useEffect, useMemo, useState } from "react";

import {
  listProjectMembers,
  getProjectMember,
  removeProjectMember,
} from "../services/project-member.api";

import { listProjects } from "../services/project.api";

import ProjectMemberForm from "../components/project-members/ProjectMemberForm";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString();
}

function getMemberName(member) {
  return (
    member.employee_name ||
    `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
    "Unknown employee"
  );
}

function getProjectName(member) {
  return member.project_name || member.name || "Unknown project";
}

function getStatus(member) {
  return member.left_at ? "inactive" : "active";
}

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function ProjectMembersPage() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [removingId, setRemovingId] = useState(null);

  async function loadProjects() {
    try {
      const response = await listProjects();

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load projects.");
      }

      setProjects(response.projects || []);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    }
  }

  async function loadMembers() {
    setLoading(true);
    setError("");

    try {
      const response = await listProjectMembers({
        search,
        projectId,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load project members.");
      }

      setMembers(response.members || []);
    } catch (err) {
      setError(err.message || "Failed to load project members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, projectId]);

  const activeCount = useMemo(
    () => members.filter((member) => getStatus(member) === "active").length,
    [members],
  );

  const inactiveCount = useMemo(
    () => members.filter((member) => getStatus(member) === "inactive").length,
    [members],
  );

  function handleAdd() {
    setEditingMember(null);
    setShowForm(true);
  }

  function handleEdit(member) {
    setEditingMember(member);
    setShowForm(true);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingMember(null);
    loadMembers();
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  async function handleView(member) {
    setLoadingDetails(true);
    setSelectedMember(null);

    try {
      const response = await getProjectMember(member.id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load project member.");
      }

      setSelectedMember(response.member);
    } catch (err) {
      setError(err.message || "Failed to load project member.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleRemove(member) {
    const memberName = getMemberName(member);

    const confirmed = window.confirm(`Remove ${memberName} from this project?`);

    if (!confirmed) return;

    setRemovingId(member.id);
    setError("");

    try {
      const response = await removeProjectMember(member.id);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to remove project member.",
        );
      }

      await loadMembers();

      if (selectedMember && Number(selectedMember.id) === Number(member.id)) {
        setSelectedMember(null);
      }
    } catch (err) {
      setError(err.message || "Failed to remove project member.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Members
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employees assigned to projects.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Member
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Members</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {members.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Inactive</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search */}
          <div>
            <label
              htmlFor="project-member-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="project-member-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, project, role..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
            />
          </div>

          {/* Project filter */}
          <div>
            <label
              htmlFor="project-member-project-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Project
            </label>

            <select
              id="project-member-project-filter"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
            >
              <option value="all">All Projects</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_code} — {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Employee
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Project
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Role
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Allocation
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Joined
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading project members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No project members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const status = getStatus(member);

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {getMemberName(member)}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-500">
                          {member.employee_code || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {getProjectName(member)}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-500">
                          {member.project_code || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {member.role_on_project || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {member.allocation_percent === null ||
                        member.allocation_percent === undefined
                          ? "—"
                          : `${member.allocation_percent}%`}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(member.joined_at)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(member)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          {status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleRemove(member)}
                              disabled={removingId === member.id}
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {removingId === member.id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            Loading project members...
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            No project members found.
          </div>
        ) : (
          members.map((member) => {
            const status = getStatus(member);

            return (
              <div
                key={member.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getMemberName(member)}
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {member.employee_code || "—"}
                    </p>
                  </div>

                  <StatusBadge status={status} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Project</span>

                    <span className="text-right font-medium text-gray-900">
                      {getProjectName(member)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Role</span>

                    <span className="text-right text-gray-900">
                      {member.role_on_project || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Allocation</span>

                    <span className="text-gray-900">
                      {member.allocation_percent === null ||
                      member.allocation_percent === undefined
                        ? "—"
                        : `${member.allocation_percent}%`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Joined</span>

                    <span className="text-gray-900">
                      {formatDate(member.joined_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleView(member)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(member)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  {status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member)}
                      disabled={removingId === member.id}
                      className="flex-1 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === member.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingMember ? "Edit Project Member" : "Add Project Member"}
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  {editingMember
                    ? "Update the project assignment."
                    : "Assign an employee to a project."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-md px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <ProjectMemberForm
                member={editingMember}
                onSaved={handleFormSaved}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {(selectedMember || loadingDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Project Member Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-md px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <p className="text-sm text-gray-500">Loading details...</p>
              ) : selectedMember ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Employee
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {getMemberName(selectedMember)}
                    </p>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {selectedMember.employee_code || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Project
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {getProjectName(selectedMember)}
                    </p>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {selectedMember.project_code || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Client
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedMember.client_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Role on Project
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedMember.role_on_project || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Allocation
                      </p>

                      <p className="mt-1 text-sm text-gray-900">
                        {selectedMember.allocation_percent === null ||
                        selectedMember.allocation_percent === undefined
                          ? "—"
                          : `${selectedMember.allocation_percent}%`}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </p>

                      <div className="mt-1">
                        <StatusBadge status={getStatus(selectedMember)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Joined
                      </p>

                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedMember.joined_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Left
                      </p>

                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedMember.left_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
