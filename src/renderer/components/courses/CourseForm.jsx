import { useEffect, useState } from "react";

const EMPTY_FORM = {
  name: "",
  description: "",
  durationWeeks: "",
  fee: "",
  totalSessions: "",
  sessionsPerWeek: "",
  currencyCode: "PKR",
  modules: [""],
  status: "active",
};

function CourseForm({
  course = null,
  mode = "create",
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const readOnly = mode === "view";

  useEffect(() => {
    if (!course) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      name: course.name || "",
      description: course.description || "",
      durationWeeks: course.durationWeeks ?? "",
      fee:
        course.feeMinor !== null && course.feeMinor !== undefined
          ? (course.feeMinor / 100).toString()
          : "",
      totalSessions: course.totalSessions ?? "",
      sessionsPerWeek: course.sessionsPerWeek ?? "",
      currencyCode: course.currencyCode || "PKR",
      modules: course.modules?.length
        ? course.modules.map((module) =>
            typeof module === "string" ? module : module.title || "",
          )
        : [""],
      status: course.status || "active",
    });

    setErrors({});
  }, [course]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function updateModule(index, value) {
    setForm((current) => {
      const modules = [...current.modules];
      modules[index] = value;

      return {
        ...current,
        modules,
      };
    });
  }

  function addModule() {
    setForm((current) => ({
      ...current,
      modules: [...current.modules, ""],
    }));
  }

  function removeModule(index) {
    setForm((current) => {
      const modules = current.modules.filter(
        (_module, moduleIndex) => moduleIndex !== index,
      );

      return {
        ...current,
        modules: modules.length ? modules : [""],
      };
    });
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Course name is required.";
    }

    if (
      form.durationWeeks !== "" &&
      (Number.isNaN(Number(form.durationWeeks)) ||
        Number(form.durationWeeks) <= 0 ||
        !Number.isInteger(Number(form.durationWeeks)))
    ) {
      nextErrors.durationWeeks = "Enter a positive whole number.";
    }

    if (
      form.totalSessions !== "" &&
      (Number.isNaN(Number(form.totalSessions)) ||
        Number(form.totalSessions) <= 0 ||
        !Number.isInteger(Number(form.totalSessions)))
    ) {
      nextErrors.totalSessions = "Enter a positive whole number.";
    }

    if (
      form.sessionsPerWeek !== "" &&
      (Number.isNaN(Number(form.sessionsPerWeek)) ||
        Number(form.sessionsPerWeek) <= 0 ||
        !Number.isInteger(Number(form.sessionsPerWeek)))
    ) {
      nextErrors.sessionsPerWeek = "Enter a positive whole number.";
    }

    if (
      form.fee !== "" &&
      (Number.isNaN(Number(form.fee)) || Number(form.fee) < 0)
    ) {
      nextErrors.fee = "Enter a valid fee.";
    }

    if (!/^[A-Z]{3}$/.test(form.currencyCode.trim().toUpperCase())) {
      nextErrors.currencyCode = "Use a 3-letter currency code.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (readOnly) return;

    if (!validate()) return;

    await onSubmit({
      ...form,
      modules: form.modules.map((module) => module.trim()).filter(Boolean),
    });
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="course-form-grid">
        <div className="course-field course-field-full">
          <label htmlFor="course-name">Course Name</label>

          <input
            id="course-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. Full Stack Web Development"
          />

          {errors.name && <span className="course-error">{errors.name}</span>}
        </div>

        <div className="course-field course-field-full">
          <label htmlFor="course-description">Description</label>

          <textarea
            id="course-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            disabled={readOnly || loading}
            rows={4}
            placeholder="Describe what students will learn."
          />

          {errors.description && (
            <span className="course-error">{errors.description}</span>
          )}
        </div>

        <div className="course-field">
          <label htmlFor="course-duration">Duration (weeks)</label>

          <input
            id="course-duration"
            type="number"
            min="1"
            value={form.durationWeeks}
            onChange={(event) =>
              updateField("durationWeeks", event.target.value)
            }
            disabled={readOnly || loading}
          />

          {errors.durationWeeks && (
            <span className="course-error">{errors.durationWeeks}</span>
          )}
        </div>

        <div className="course-field">
          <label htmlFor="course-sessions">Total Sessions</label>

          <input
            id="course-sessions"
            type="number"
            min="1"
            value={form.totalSessions}
            onChange={(event) =>
              updateField("totalSessions", event.target.value)
            }
            disabled={readOnly || loading}
          />

          {errors.totalSessions && (
            <span className="course-error">{errors.totalSessions}</span>
          )}
        </div>

        <div className="course-field">
          <label htmlFor="course-sessions-week">Sessions / Week</label>

          <input
            id="course-sessions-week"
            type="number"
            min="1"
            value={form.sessionsPerWeek}
            onChange={(event) =>
              updateField("sessionsPerWeek", event.target.value)
            }
            disabled={readOnly || loading}
          />

          {errors.sessionsPerWeek && (
            <span className="course-error">{errors.sessionsPerWeek}</span>
          )}
        </div>

        <div className="course-field">
          <label htmlFor="course-fee">Fee</label>

          <input
            id="course-fee"
            type="number"
            min="0"
            step="0.01"
            value={form.fee}
            onChange={(event) => updateField("fee", event.target.value)}
            disabled={readOnly || loading}
            placeholder="0"
          />

          {errors.fee && <span className="course-error">{errors.fee}</span>}
        </div>

        <div className="course-field">
          <label htmlFor="course-currency">Currency</label>

          <input
            id="course-currency"
            value={form.currencyCode}
            maxLength={3}
            onChange={(event) =>
              updateField("currencyCode", event.target.value.toUpperCase())
            }
            disabled={readOnly || loading}
          />

          {errors.currencyCode && (
            <span className="course-error">{errors.currencyCode}</span>
          )}
        </div>

        <div className="course-field">
          <label htmlFor="course-status">Status</label>

          <select
            id="course-status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            disabled={readOnly || loading}
          >
            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

            <option value="archived">Archived</option>
          </select>

          {errors.status && (
            <span className="course-error">{errors.status}</span>
          )}
        </div>

        <div className="course-field course-field-full">
          <div className="course-module-header">
            <label>Syllabus / Modules</label>

            {!readOnly && (
              <button
                type="button"
                className="course-secondary-button"
                onClick={addModule}
                disabled={loading}
              >
                + Add Module
              </button>
            )}
          </div>

          <div className="course-modules">
            {form.modules.map((module, index) => (
              <div className="course-module-row" key={`${index}-${module}`}>
                <input
                  value={module}
                  onChange={(event) => updateModule(index, event.target.value)}
                  disabled={readOnly || loading}
                  placeholder={`Module ${index + 1}`}
                />

                {!readOnly && (
                  <button
                    type="button"
                    className="course-remove-button"
                    onClick={() => removeModule(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.modules && (
            <span className="course-error">{errors.modules}</span>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="course-form-actions">
          <button
            type="button"
            className="course-secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="course-primary-button"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : mode === "edit"
                ? "Update Course"
                : "Create Course"}
          </button>
        </div>
      )}

      {readOnly && (
        <div className="course-form-actions">
          <button
            type="button"
            className="course-primary-button"
            onClick={onCancel}
          >
            Close
          </button>
        </div>
      )}
    </form>
  );
}

export default CourseForm;
