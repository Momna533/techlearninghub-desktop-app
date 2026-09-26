import { useEffect, useState } from "react";

import { createMilestone, updateMilestone } from "../../services/milestone.api";

import { listProjects } from "../../services/project.api";

const EMPTY_FORM = {
  projectId: "",
  name: "",
  description: "",
  status: "planned",
  dueDate: "",
  completedAt: "",
  amount: "",
  sortOrder: "",
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

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function formatAmountForInput(amountMinor) {
  if (amountMinor === null || amountMinor === undefined || amountMinor === "") {
    return "";
  }

  const numericAmount = Number(amountMinor);

  if (!Number.isFinite(numericAmount)) {
    return "";
  }

  return (numericAmount / 100).toString();
}

function buildFormFromMilestone(milestone) {
  if (!milestone) {
    return {
      ...EMPTY_FORM,
    };
  }

  return {
    projectId: milestone.project_id ?? milestone.projectId ?? "",

    name: milestone.name ?? "",

    description: milestone.description ?? "",

    status: milestone.status ?? "planned",

    dueDate: formatDateForInput(milestone.due_date ?? milestone.dueDate),

    completedAt: formatDateForInput(
      milestone.completed_at ?? milestone.completedAt,
    ),

    amount: formatAmountForInput(
      milestone.amount_minor ?? milestone.amountMinor,
    ),

    sortOrder: milestone.sort_order ?? milestone.sortOrder ?? "",
  };
}

function getTodayForInput() {
  return new Date().toISOString().slice(0, 10);
}

export default function MilestoneForm({ milestone = null, onSaved, onCancel }) {
  const isEditing = Boolean(milestone);

  const [form, setForm] = useState(() => buildFormFromMilestone(milestone));

  const [projects, setProjects] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   * Reset the form whenever the selected
   * milestone changes.
   *
   * This matters when the same modal is reused
   * for multiple milestones.
   */
  useEffect(() => {
    setForm(buildFormFromMilestone(milestone));

    setError("");
  }, [milestone]);

  /*
   * Load projects for the project dropdown.
   */
  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setError("");

        const result = await listProjects();
        console.log("MILESTONE PROJECT RESULT:", result.projects);

        if (!mounted) {
          return;
        }

        setProjects(Array.isArray(result.projects) ? result.projects : []);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err?.message || "Failed to load projects.");
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      /*
       * Completed date only makes sense
       * when status is completed.
       */
      if (name === "status" && value !== "completed") {
        next.completedAt = "";
      }

      /*
       * If the user marks a milestone completed
       * and no completed date exists, use today.
       */
      if (name === "status" && value === "completed" && !current.completedAt) {
        next.completedAt = getTodayForInput();
      }

      return next;
    });

    if (error) {
      setError("");
    }
  }

  function validate() {
    const projectId = Number(form.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return "Please select a valid project.";
    }

    const name = form.name.trim();

    if (!name) {
      return "Milestone name is required.";
    }

    if (name.length > 200) {
      return "Milestone name cannot exceed 200 characters.";
    }

    if (!STATUS_OPTIONS.some((option) => option.value === form.status)) {
      return "Please select a valid status.";
    }

    /*
     * A completed milestone must have a
     * completed date.
     */
    if (form.status === "completed" && !form.completedAt) {
      return "Completed date is required when the milestone is completed.";
    }

    /*
     * A non-completed milestone must not
     * retain a completed date.
     */
    if (form.status !== "completed" && form.completedAt) {
      return "Completed date can only be set for a completed milestone.";
    }

    /*
     * We intentionally do NOT require:
     *
     * completed date >= due date
     *
     * because a milestone can be completed
     * before its planned due date.
     */

    if (form.amount !== "") {
      const amount = Number(form.amount);

      if (!Number.isFinite(amount) || amount < 0) {
        return "Amount must be a valid non-negative number.";
      }

      /*
       * Your database stores currency in minor
       * units, so maximum precision is 2 decimals.
       */
      if (!Number.isInteger(Math.round(amount * 100))) {
        return "Amount can have a maximum of 2 decimal places.";
      }
    }

    if (form.sortOrder !== "") {
      const sortOrder = Number(form.sortOrder);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return "Sort order must be a non-negative whole number.";
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const amountMinor =
        form.amount === "" ? null : Math.round(Number(form.amount) * 100);

      const sortOrder = form.sortOrder === "" ? null : Number(form.sortOrder);

      const payload = {
        projectId: Number(form.projectId),

        name: form.name.trim(),

        description: form.description.trim() || null,

        status: form.status,

        dueDate: form.dueDate || null,

        completedAt:
          form.status === "completed"
            ? form.completedAt || getTodayForInput()
            : null,

        amountMinor,

        sortOrder,
      };

      let result;

      if (isEditing) {
        result = await updateMilestone(milestone.id, payload);
      } else {
        result = await createMilestone(payload);
      }

      if (onSaved) {
        onSaved(result);
      }
    } catch (err) {
      setError(err?.message || "Failed to save milestone.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Project */}
      <div>
        <label
          htmlFor="milestone-project"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Project
          <span className="ml-1 text-red-500">*</span>
        </label>

        <select
          id="milestone-project"
          name="projectId"
          value={form.projectId}
          onChange={handleChange}
          disabled={loadingProjects || saving}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">
            {loadingProjects ? "Loading projects..." : "Select project"}
          </option>

          {projects.map((project) => {
            const projectCode =
              project.project_code ?? project.projectCode ?? "";

            const projectName =
              project.name ?? project.project_name ?? "Unnamed Project";

            return (
              <option key={project.id} value={project.id}>
                {projectCode ? `${projectCode} — ${projectName}` : projectName}
              </option>
            );
          })}
        </select>

        {!loadingProjects && projects.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-600">
            No projects are available. Create a project before creating a
            milestone.
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="milestone-name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Milestone Name
          <span className="ml-1 text-red-500">*</span>
        </label>

        <input
          id="milestone-name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. UI Design Complete"
          maxLength={200}
          disabled={saving}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="milestone-description"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="milestone-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe what this milestone represents..."
          disabled={saving}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
        />
      </div>

      {/* Status + Due Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="milestone-status"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="milestone-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="milestone-due-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Due Date
          </label>

          <input
            id="milestone-due-date"
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Completed date */}
      {form.status === "completed" && (
        <div>
          <label
            htmlFor="milestone-completed-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Completed Date
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="milestone-completed-date"
            type="date"
            name="completedAt"
            value={form.completedAt}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            This records when the milestone was actually completed.
          </p>
        </div>
      )}

      {/* Amount + Sort Order */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="milestone-amount"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Amount
          </label>

          <input
            id="milestone-amount"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="e.g. 50000"
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Optional milestone amount.
          </p>
        </div>

        <div>
          <label
            htmlFor="milestone-sort-order"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Sort Order
          </label>

          <input
            id="milestone-sort-order"
            type="number"
            name="sortOrder"
            value={form.sortOrder}
            onChange={handleChange}
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Automatic"
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Leave empty to assign automatically.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || loadingProjects || projects.length === 0}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update Milestone"
              : "Create Milestone"}
        </button>
      </div>
    </form>
  );
}
