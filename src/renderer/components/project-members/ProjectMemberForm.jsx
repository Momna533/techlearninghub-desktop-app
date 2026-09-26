import { useEffect, useState } from "react";

import {
  createProjectMember,
  updateProjectMember,
} from "../../services/project-member.api";

import { listProjects } from "../../services/project.api";
import { listEmployees } from "../../services/employee.api";

const EMPTY_FORM = {
  projectId: "",
  employeeId: "",
  roleOnProject: "",
  allocationPercent: "",
  joinedAt: "",
  leftAt: "",
};

function formatDateForInput(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

export default function ProjectMemberForm({
  member = null,
  onSaved,
  onCancel,
}) {
  const isEditing = Boolean(member);

  const [form, setForm] = useState(EMPTY_FORM);

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [projectsResponse, employeesResponse] = await Promise.all([
          listProjects(),
          listEmployees(),
        ]);

        if (!projectsResponse?.success) {
          throw new Error(
            projectsResponse?.message || "Failed to load projects.",
          );
        }

        if (!employeesResponse?.success) {
          throw new Error(
            employeesResponse?.message || "Failed to load employees.",
          );
        }

        setProjects(projectsResponse.projects || []);

        setEmployees(employeesResponse.employees || []);
      } catch (err) {
        setError(err.message || "Failed to load form data.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    if (!member) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      projectId: member.project_id ?? member.projectId ?? "",

      employeeId: member.employee_id ?? member.employeeId ?? "",

      roleOnProject: member.role_on_project ?? member.roleOnProject ?? "",

      allocationPercent:
        member.allocation_percent ?? member.allocationPercent ?? "",

      joinedAt: formatDateForInput(member.joined_at ?? member.joinedAt),

      leftAt: formatDateForInput(member.left_at ?? member.leftAt),
    });
  }, [member]);

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

    if (!form.projectId) {
      setError("Project is required.");
      return;
    }

    if (!form.employeeId) {
      setError("Employee is required.");
      return;
    }

    if (!form.roleOnProject.trim()) {
      setError("Role on project is required.");
      return;
    }

    if (!form.joinedAt) {
      setError("Joined date is required.");
      return;
    }

    if (
      form.allocationPercent !== "" &&
      (!Number.isInteger(Number(form.allocationPercent)) ||
        Number(form.allocationPercent) < 0 ||
        Number(form.allocationPercent) > 100)
    ) {
      setError("Allocation must be a whole number between 0 and 100.");
      return;
    }

    if (form.leftAt && form.leftAt < form.joinedAt) {
      setError("Left date cannot be before joined date.");
      return;
    }

    const payload = {
      projectId: Number(form.projectId),

      employeeId: Number(form.employeeId),

      roleOnProject: form.roleOnProject.trim(),

      allocationPercent:
        form.allocationPercent === "" ? null : Number(form.allocationPercent),

      joinedAt: form.joinedAt,

      leftAt: form.leftAt || null,
    };

    setSaving(true);

    try {
      const response = isEditing
        ? await updateProjectMember(member.id, payload)
        : await createProjectMember(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save project member.");
      }

      if (onSaved) {
        onSaved(response.member);
      }
    } catch (err) {
      setError(err.message || "Failed to save project member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loadingOptions ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Loading projects and employees...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Project */}
            <div>
              <label
                htmlFor="projectId"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Project
              </label>

              <select
                id="projectId"
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              >
                <option value="">Select project</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_code} — {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee */}
            <div>
              <label
                htmlFor="employeeId"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Employee
              </label>

              <select
                id="employeeId"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              >
                <option value="">Select employee</option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employee_code} — {employee.first_name}{" "}
                    {employee.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="roleOnProject"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Role on Project
              </label>

              <input
                id="roleOnProject"
                name="roleOnProject"
                type="text"
                value={form.roleOnProject}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Allocation */}
            <div>
              <label
                htmlFor="allocationPercent"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Allocation (%)
              </label>

              <input
                id="allocationPercent"
                name="allocationPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.allocationPercent}
                onChange={handleChange}
                placeholder="e.g. 50"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />

              <p className="mt-1 text-xs text-gray-500">
                Optional. Enter a whole number from 0 to 100.
              </p>
            </div>

            {/* Joined date */}
            <div>
              <label
                htmlFor="joinedAt"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Joined Date
              </label>

              <input
                id="joinedAt"
                name="joinedAt"
                type="date"
                value={form.joinedAt}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Left date */}
            <div>
              <label
                htmlFor="leftAt"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Left Date
              </label>

              <input
                id="leftAt"
                name="leftAt"
                type="date"
                value={form.leftAt}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />

              <p className="mt-1 text-xs text-gray-500">
                Leave empty while the employee is actively assigned.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Member"
                  : "Add Member"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
