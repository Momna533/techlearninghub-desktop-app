import { useEffect, useState } from "react";

import { createProject, updateProject } from "../../services/project.api";

import { listClients } from "../../services/client.api";
import { listEmployees } from "../../services/employee.api";

const EMPTY_FORM = {
  clientId: "",
  projectManagerEmployeeId: "",
  projectCode: "",
  name: "",
  description: "",
  status: "planned",
  startDate: "",
  endDate: "",
  budgetMinor: "",
  contractValueMinor: "",
  currencyCode: "PKR",
};

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getInitialForm(project) {
  if (!project) {
    return EMPTY_FORM;
  }

  return {
    clientId: project.client_id ?? "",
    projectManagerEmployeeId: project.project_manager_employee_id ?? "",
    projectCode: project.project_code ?? "",
    name: project.name ?? "",
    description: project.description ?? "",
    status: project.status ?? "planned",
    startDate: project.start_date ?? "",
    endDate: project.end_date ?? "",
    budgetMinor:
      project.budget_minor !== null && project.budget_minor !== undefined
        ? Number(project.budget_minor) / 100
        : "",
    contractValueMinor:
      project.contract_value_minor !== null &&
      project.contract_value_minor !== undefined
        ? Number(project.contract_value_minor) / 100
        : "",
    currencyCode: project.currency_code ?? "PKR",
  };
}

function toMinorUnits(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return Math.round(number * 100);
}

export default function ProjectForm({ project = null, onSuccess, onCancel }) {
  const isEditing = Boolean(project);

  const [form, setForm] = useState(getInitialForm(project));

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(project));
  }, [project]);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [clientsResponse, employeesResponse] = await Promise.all([
          listClients(),
          listEmployees(),
        ]);

        if (!clientsResponse?.success) {
          throw new Error(
            clientsResponse?.message || "Failed to load clients.",
          );
        }

        if (!employeesResponse?.success) {
          throw new Error(
            employeesResponse?.message || "Failed to load employees.",
          );
        }

        setClients(clientsResponse.clients || []);

        setEmployees(employeesResponse.employees || []);
      } catch (err) {
        console.error("[ProjectForm] Failed to load options:", err);

        setError(err.message || "Failed to load form options.");
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
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }

    if (!form.projectCode.trim()) {
      setError("Project code is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    if (
      form.budgetMinor !== "" &&
      (Number.isNaN(Number(form.budgetMinor)) || Number(form.budgetMinor) < 0)
    ) {
      setError("Budget must be a valid amount.");
      return;
    }

    if (
      form.contractValueMinor !== "" &&
      (Number.isNaN(Number(form.contractValueMinor)) ||
        Number(form.contractValueMinor) < 0)
    ) {
      setError("Contract value must be a valid amount.");
      return;
    }

    const projectData = {
      clientId: Number(form.clientId),

      proposalId: null,

      projectManagerEmployeeId: form.projectManagerEmployeeId
        ? Number(form.projectManagerEmployeeId)
        : null,

      projectCode: form.projectCode.trim(),

      name: form.name.trim(),

      description: form.description.trim(),

      status: form.status,

      startDate: form.startDate,

      endDate: form.endDate || null,

      budgetMinor: toMinorUnits(form.budgetMinor),

      contractValueMinor: toMinorUnits(form.contractValueMinor),

      currencyCode: form.currencyCode.trim().toUpperCase(),
    };

    setSaving(true);

    try {
      const response = isEditing
        ? await updateProject(project.id, projectData)
        : await createProject(projectData);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            (isEditing
              ? "Failed to update project."
              : "Failed to create project."),
        );
      }

      onSuccess?.(response.project);
    } catch (err) {
      console.error("[ProjectForm] Save failed:", err);

      setError(err.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Client */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Client <span className="text-red-500">*</span>
          </label>

          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            disabled={loadingOptions || saving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            <option value="">
              {loadingOptions ? "Loading clients..." : "Select client"}
            </option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Manager */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Project Manager
          </label>

          <select
            name="projectManagerEmployeeId"
            value={form.projectManagerEmployeeId}
            onChange={handleChange}
            disabled={loadingOptions || saving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            <option value="">No project manager</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Code */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Project Code <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="projectCode"
            value={form.projectCode}
            onChange={handleChange}
            disabled={saving}
            placeholder="e.g. PRJ-001"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Project Name */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Project Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={saving}
            placeholder="Enter project name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Start Date <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            End Date
          </label>

          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Budget
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            name="budgetMinor"
            value={form.budgetMinor}
            onChange={handleChange}
            disabled={saving}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Contract Value */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Contract Value
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            name="contractValueMinor"
            value={form.contractValueMinor}
            onChange={handleChange}
            disabled={saving}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Currency
          </label>

          <input
            type="text"
            name="currencyCode"
            value={form.currencyCode}
            onChange={handleChange}
            disabled={saving}
            maxLength={3}
            placeholder="PKR"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={saving}
          rows={4}
          placeholder="Describe the project..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || loadingOptions}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update Project"
              : "Create Project"}
        </button>
      </div>
    </form>
  );
}
