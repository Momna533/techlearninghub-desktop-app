import { useEffect, useState } from "react";

import { listProjects, getProject } from "../services/project.api";

import ProjectForm from "../components/projects/ProjectForm";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(false);

  const [showForm, setShowForm] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const result = await listProjects({
        search,
        status,
      });

      if (!result.success) {
        setError(result.message || "Failed to load projects.");

        setProjects([]);
        setLoading(false);
        return;
      }

      setProjects(result.projects || []);
    } catch (error) {
      console.error("[ProjectsPage] Failed to load projects:", error);

      setError("Failed to load projects.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [search, status]);

  async function handleView(projectId) {
    setLoadingProject(true);
    setError("");

    try {
      const result = await getProject(projectId);

      if (!result.success) {
        setError(result.message || "Failed to load project.");

        return;
      }

      setSelectedProject(result.project);
    } catch (error) {
      console.error("[ProjectsPage] Failed to load project:", error);

      setError("Failed to load project.");
    } finally {
      setLoadingProject(false);
    }
  }

  function handleCloseProject() {
    setSelectedProject(null);
  }

  function handleCreate() {
    setSelectedProject(null);
    setShowForm(true);
  }

  function handleEdit(project) {
    setSelectedProject(project);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedProject(null);
  }

  async function handleFormSuccess() {
    setShowForm(false);
    setSelectedProject(null);

    await loadProjects();
  }

  function getStatusClasses(projectStatus) {
    switch (projectStatus) {
      case "planned":
        return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20";

      case "active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";

      case "on_hold":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";

      case "completed":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";

      case "cancelled":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
    }
  }

  function formatStatus(projectStatus) {
    if (!projectStatus) return "-";

    return projectStatus
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  }

  function formatMoney(amountMinor, currencyCode) {
    if (amountMinor === null || amountMinor === undefined) {
      return "-";
    }

    const amount = Number(amountMinor) / 100;

    return `${currencyCode || ""} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`.trim();
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Software House</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Projects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage software projects, clients, timelines, budgets and project
              managers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:w-auto"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Project
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="mt-0.5 font-semibold">!</span>

            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full lg:flex-1">
              <label
                htmlFor="project-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <input
                id="project-search"
                type="search"
                placeholder="Search by project code, name or client..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="project-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="project-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All statuses</option>

                <option value="planned">Planned</option>

                <option value="active">Active</option>

                <option value="on_hold">On Hold</option>

                <option value="completed">Completed</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        {/* Loading single project */}
        {loadingProject && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
            Loading project...
          </div>
        )}

        {/* Projects */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Project Records
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

              <p className="mt-3 text-sm text-slate-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                —
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No projects found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {search || status !== "all"
                  ? "Try changing your search or filter."
                  : "Add your first project to start managing your software house projects."}
              </p>

              {!search && status === "all" && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add Project
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Project
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Client
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Project Manager
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Timeline
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {project.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {project.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {project.project_code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {project.client_name || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {project.project_manager_name || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {formatDate(project.start_date)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            to {formatDate(project.end_date)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              project.status,
                            )}`}
                          >
                            {formatStatus(project.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleView(project.id)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(project)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-200 md:hidden">
                {projects.map((project) => (
                  <div key={project.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {project.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {project.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {project.project_code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          project.status,
                        )}`}
                      >
                        {formatStatus(project.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Client</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {project.client_name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Manager</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {project.project_manager_name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Start</p>

                        <p className="mt-0.5 text-sm text-slate-700">
                          {formatDate(project.start_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">End</p>

                        <p className="mt-0.5 text-sm text-slate-700">
                          {formatDate(project.end_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Contract Value</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {formatMoney(
                            project.contract_value_minor,
                            project.currency_code,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Budget</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {formatMoney(
                            project.budget_minor,
                            project.currency_code,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleView(project.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Project Details Modal */}
      {selectedProject && !showForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseProject();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-view-title"
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                  {selectedProject.name?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="project-view-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      {selectedProject.name}
                    </h2>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        selectedProject.status,
                      )}`}
                    >
                      {formatStatus(selectedProject.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedProject.project_code}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseProject}
                className="self-start flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Project Code
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedProject.project_code}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Client
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedProject.client_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Project Manager
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedProject.project_manager_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Start Date
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedProject.start_date)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  End Date
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedProject.end_date)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Currency
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedProject.currency_code || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Budget
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatMoney(
                    selectedProject.budget_minor,
                    selectedProject.currency_code,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Contract Value
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatMoney(
                    selectedProject.contract_value_minor,
                    selectedProject.currency_code,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Created
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedProject.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Updated
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedProject.updated_at)}
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                  {selectedProject.description || "-"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => handleEdit(selectedProject)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit Project
              </button>

              <button
                type="button"
                onClick={handleCloseProject}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Form Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <h2
                  id="project-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {selectedProject ? "Edit Project" : "Add Project"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedProject
                    ? "Update the project information."
                    : "Create a new software project."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-5 sm:p-6">
              <ProjectForm
                project={selectedProject}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
