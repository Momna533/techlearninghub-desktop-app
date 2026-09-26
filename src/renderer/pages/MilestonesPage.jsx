import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listMilestones,
  getMilestone,
  changeMilestoneStatus,
} from "../services/milestone.api";

import { listProjects } from "../services/project.api";

import MilestoneForm from "../components/milestones/MilestoneForm";

const STATUS_LABELS = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = [
  {
    value: "planned",
    label: "Planned",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

function formatStatus(status) {
  return STATUS_LABELS[status] || status || "Unknown";
}

function getValue(item, snakeCaseKey, camelCaseKey) {
  return item?.[snakeCaseKey] ?? item?.[camelCaseKey];
}

function getProjectId(project) {
  return project?.id;
}

function getProjectCode(project) {
  return project?.project_code ?? project?.projectCode ?? "";
}

function getProjectName(project) {
  return project?.name ?? project?.project_name ?? "Unnamed Project";
}

function getMilestoneProjectId(milestone) {
  return getValue(milestone, "project_id", "projectId");
}

function getMilestoneSortOrder(milestone) {
  const value = getValue(milestone, "sort_order", "sortOrder");

  const number = Number(value);

  return Number.isInteger(number) ? number : 0;
}

function getMilestoneDueDate(milestone) {
  return getValue(milestone, "due_date", "dueDate");
}

function getMilestoneCompletedAt(milestone) {
  return getValue(milestone, "completed_at", "completedAt");
}

function getMilestoneAmount(milestone) {
  return getValue(milestone, "amount_minor", "amountMinor");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return String(value).slice(0, 10);
}

function formatAmount(amountMinor) {
  if (amountMinor === null || amountMinor === undefined || amountMinor === "") {
    return "—";
  }

  const numericAmount = Number(amountMinor);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  return (numericAmount / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "planned":
      return "bg-gray-100 text-gray-700";

    case "in_progress":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function isOverdue(milestone) {
  const dueDate = getMilestoneDueDate(milestone);

  const status = milestone?.status;

  if (!dueDate || status === "completed" || status === "cancelled") {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);

  return String(dueDate).slice(0, 10) < today;
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([]);

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [projectFilter, setProjectFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [loadingProjects, setLoadingProjects] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingMilestone, setEditingMilestone] = useState(null);

  const [viewingMilestone, setViewingMilestone] = useState(null);

  const [changingStatusId, setChangingStatusId] = useState(null);

  /*
   * Load projects once.
   */
  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);

      const result = await listProjects();
      console.log(result);

      setProjects(Array.isArray(result.projects) ? result.projects : []);
    } catch (err) {
      setError(err?.message || "Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  /*
   * Load milestones according to
   * the current filters.
   */
  const loadMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listMilestones({
        search,
        projectId: projectFilter,
        status: statusFilter,
      });

      setMilestones(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  }, [search, projectFilter, statusFilter]);

  /*
   * Projects are independent of
   * milestone search/filtering.
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /*
   * Debounced milestone search/filter.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMilestones();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [loadMilestones]);

  /*
   * Summary cards are based on the
   * milestones currently loaded.
   *
   * Since the backend applies filters,
   * these represent the current view.
   */
  const counts = useMemo(() => {
    return {
      total: milestones.length,

      planned: milestones.filter((item) => item.status === "planned").length,

      inProgress: milestones.filter((item) => item.status === "in_progress")
        .length,

      completed: milestones.filter((item) => item.status === "completed")
        .length,

      cancelled: milestones.filter((item) => item.status === "cancelled")
        .length,

      overdue: milestones.filter((item) => isOverdue(item)).length,
    };
  }, [milestones]);

  function handleCreate() {
    setError("");
    setEditingMilestone(null);
    setShowForm(true);
  }

  function handleEdit(milestone) {
    setError("");
    setViewingMilestone(null);
    setEditingMilestone(milestone);
    setShowForm(true);
  }

  async function handleView(milestone) {
    try {
      setError("");

      const result = await getMilestone(milestone.id);

      setViewingMilestone(result);
    } catch (err) {
      setError(err?.message || "Failed to load milestone details.");
    }
  }

  async function handleStatusChange(milestone, status) {
    if (milestone.status === status) {
      return;
    }

    /*
     * Completed status should go through
     * the edit form because completing a
     * milestone requires a completed date.
     *
     * This avoids silently using the current
     * timestamp from the table.
     */
    if (status === "completed") {
      handleEdit(milestone);
      return;
    }

    try {
      setChangingStatusId(milestone.id);

      setError("");

      await changeMilestoneStatus(milestone.id, status);

      await loadMilestones();
    } catch (err) {
      setError(err?.message || "Failed to change milestone status.");
    } finally {
      setChangingStatusId(null);
    }
  }

  async function handleSaved() {
    setShowForm(false);
    setEditingMilestone(null);
    setError("");

    await loadMilestones();
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingMilestone(null);
  }

  function handleViewEdit() {
    if (!viewingMilestone) {
      return;
    }

    const milestone = viewingMilestone;

    setViewingMilestone(null);
    setEditingMilestone(milestone);
    setShowForm(true);
  }

  /*
   * Escape closes whichever modal
   * is currently open.
   */
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (showForm) {
        handleFormCancel();
      }

      if (viewingMilestone) {
        setViewingMilestone(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm, viewingMilestone]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Milestones</h1>

          <p className="mt-1 text-sm text-gray-500">
            Track project milestones, deadlines, amounts, and completion status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Add Milestone
        </button>
      </div>

      {/* Error */}

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total", counts.total],
          ["Planned", counts.planned],
          ["In Progress", counts.inProgress],
          ["Completed", counts.completed],
          ["Cancelled", counts.cancelled],
          ["Overdue", counts.overdue],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {label}
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row">
        <div className="flex-1">
          <label htmlFor="milestone-search" className="sr-only">
            Search milestones
          </label>

          <input
            id="milestone-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search milestones, projects, or clients..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="lg:w-64">
          <label htmlFor="milestone-project-filter" className="sr-only">
            Filter by project
          </label>

          <select
            id="milestone-project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            disabled={loadingProjects}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          >
            <option value="all">
              {loadingProjects ? "Loading projects..." : "All Projects"}
            </option>

            {projects.map((project) => (
              <option key={getProjectId(project)} value={getProjectId(project)}>
                {getProjectCode(project)
                  ? `${getProjectCode(project)} — ${getProjectName(project)}`
                  : getProjectName(project)}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:w-48">
          <label htmlFor="milestone-status-filter" className="sr-only">
            Filter by status
          </label>

          <select
            id="milestone-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">All Statuses</option>

            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Milestone
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Project
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Due Date
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading milestones...
                  </td>
                </tr>
              ) : milestones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-gray-900">
                      No milestones found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {search ||
                      projectFilter !== "all" ||
                      statusFilter !== "all"
                        ? "Try changing your search or filters."
                        : "Create your first milestone to get started."}
                    </p>

                    {!search &&
                      projectFilter === "all" &&
                      statusFilter === "all" && (
                        <button
                          type="button"
                          onClick={handleCreate}
                          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          Add Milestone
                        </button>
                      )}
                  </td>
                </tr>
              ) : (
                milestones.map((milestone) => {
                  const dueDate = getMilestoneDueDate(milestone);

                  const overdue = isOverdue(milestone);

                  return (
                    <tr key={milestone.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {getMilestoneSortOrder(milestone) + 1}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleView(milestone)}
                          className="text-left"
                        >
                          <p className="font-medium text-gray-900 hover:underline">
                            {milestone.name}
                          </p>

                          {milestone.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {milestone.description}
                            </p>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {getValue(milestone, "project_code", "projectCode") ||
                            "—"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {getValue(milestone, "project_name", "projectName") ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            milestone.status,
                          )}`}
                        >
                          {formatStatus(milestone.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={
                            overdue
                              ? "text-sm font-medium text-red-600"
                              : "text-sm text-gray-700"
                          }
                        >
                          {formatDate(dueDate)}
                        </p>

                        {overdue && (
                          <p className="text-xs text-red-500">Overdue</p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatAmount(getMilestoneAmount(milestone))}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(milestone)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(milestone)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <select
                            value={milestone.status}
                            disabled={changingStatusId === milestone.id}
                            onChange={(event) =>
                              handleStatusChange(milestone, event.target.value)
                            }
                            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-gray-500 disabled:bg-gray-100"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
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

      {/* Mobile Cards */}

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            Loading milestones...
          </div>
        ) : milestones.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">
              No milestones found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {search || projectFilter !== "all" || statusFilter !== "all"
                ? "Try changing your search or filters."
                : "Create your first milestone to get started."}
            </p>

            {!search && projectFilter === "all" && statusFilter === "all" && (
              <button
                type="button"
                onClick={handleCreate}
                className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add Milestone
              </button>
            )}
          </div>
        ) : (
          milestones.map((milestone) => {
            const overdue = isOverdue(milestone);

            return (
              <div
                key={milestone.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      #{getMilestoneSortOrder(milestone) + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleView(milestone)}
                      className="mt-1 text-left font-medium text-gray-900 hover:underline"
                    >
                      {milestone.name}
                    </button>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {getValue(milestone, "project_code", "projectCode") ||
                        "—"}{" "}
                      —{" "}
                      {getValue(milestone, "project_name", "projectName") ||
                        "—"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      milestone.status,
                    )}`}
                  >
                    {formatStatus(milestone.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>

                    <p
                      className={
                        overdue
                          ? "mt-1 font-medium text-red-600"
                          : "mt-1 text-gray-700"
                      }
                    >
                      {formatDate(getMilestoneDueDate(milestone))}
                    </p>

                    {overdue && (
                      <p className="mt-0.5 text-xs text-red-500">Overdue</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Amount</p>

                    <p className="mt-1 text-gray-700">
                      {formatAmount(getMilestoneAmount(milestone))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleView(milestone)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(milestone)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-2">
                  <select
                    value={milestone.status}
                    disabled={changingStatusId === milestone.id}
                    onChange={(event) =>
                      handleStatusChange(milestone, event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-gray-500 disabled:bg-gray-100"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleFormCancel();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMilestone ? "Edit Milestone" : "Add Milestone"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingMilestone
                    ? "Update the milestone details."
                    : "Create a milestone for a project."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFormCancel}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <MilestoneForm
              milestone={editingMilestone}
              onSaved={handleSaved}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}

      {viewingMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewingMilestone(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Milestone
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {viewingMilestone.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingMilestone(null)}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Project
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {getValue(viewingMilestone, "project_code", "projectCode") ||
                    "—"}{" "}
                  —{" "}
                  {getValue(viewingMilestone, "project_name", "projectName") ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Client
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {getValue(viewingMilestone, "client_name", "clientName") ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {viewingMilestone.description || "No description."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      viewingMilestone.status,
                    )}`}
                  >
                    {formatStatus(viewingMilestone.status)}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Sort Order
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {getMilestoneSortOrder(viewingMilestone) + 1}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Due Date
                  </p>

                  <p
                    className={
                      isOverdue(viewingMilestone)
                        ? "mt-1 font-medium text-red-600"
                        : "mt-1 text-sm text-gray-900"
                    }
                  >
                    {formatDate(getMilestoneDueDate(viewingMilestone))}
                  </p>

                  {isOverdue(viewingMilestone) && (
                    <p className="mt-0.5 text-xs text-red-500">Overdue</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Completed
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(getMilestoneCompletedAt(viewingMilestone))}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Amount
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {formatAmount(getMilestoneAmount(viewingMilestone))}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
              <button
                type="button"
                onClick={() => setViewingMilestone(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleViewEdit}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Edit Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
