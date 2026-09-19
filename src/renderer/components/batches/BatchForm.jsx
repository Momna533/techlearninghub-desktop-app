import { useEffect, useState } from "react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_FORM = {
  batchCode: "",
  name: "",
  courseId: "",
  trainerEmployeeId: "",
  startDate: "",
  endDate: "",
  days: [],
  startTime: "",
  endTime: "",
  room: "",
  capacity: "",
  fee: "",
  currencyCode: "PKR",
  status: "planned",
  enrolledCount: 0,
};

function BatchForm({
  batch = null,
  mode = "create",
  courses = [],
  trainers = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const readOnly = mode === "view";

  useEffect(() => {
    if (!batch) {
      setForm(EMPTY_FORM);
      setErrors({});

      return;
    }

    setForm({
      batchCode: batch.batchCode || "",
      name: batch.name || "",
      courseId: batch.courseId ?? "",
      trainerEmployeeId: batch.trainerEmployeeId ?? "",
      startDate: batch.startDate || "",
      endDate: batch.endDate || "",
      days: Array.isArray(batch.days) ? batch.days : [],
      startTime: batch.startTime || "",
      endTime: batch.endTime || "",
      room: batch.room || "",
      capacity: batch.capacity ?? "",
      fee:
        batch.feeMinor !== null && batch.feeMinor !== undefined
          ? (batch.feeMinor / 100).toString()
          : "",
      currencyCode: batch.currencyCode || "PKR",
      status: batch.status || "planned",
      enrolledCount: batch.enrolledCount ?? 0,
    });

    setErrors({});
  }, [batch]);

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

  function toggleDay(day) {
    setForm((current) => {
      const days = current.days.includes(day)
        ? current.days.filter((currentDay) => currentDay !== day)
        : [...current.days, day];

      return {
        ...current,
        days,
      };
    });

    setErrors((current) => ({
      ...current,
      days: undefined,
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Batch name is required.";
    }

    if (!form.courseId) {
      nextErrors.courseId = "Course is required.";
    }

    if (!form.trainerEmployeeId) {
      nextErrors.trainerEmployeeId = "Trainer is required.";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Start date is required.";
    }

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "End date cannot be before start date.";
    }

    if (!form.days.length) {
      nextErrors.days = "Select at least one day.";
    }

    if (!form.startTime) {
      nextErrors.startTime = "Start time is required.";
    }

    if (!form.endTime) {
      nextErrors.endTime = "End time is required.";
    }

    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      nextErrors.endTime = "End time must be later than start time.";
    }

    if (!form.room.trim()) {
      nextErrors.room = "Room is required.";
    }

    if (
      form.capacity !== "" &&
      (Number.isNaN(Number(form.capacity)) ||
        Number(form.capacity) <= 0 ||
        !Number.isInteger(Number(form.capacity)))
    ) {
      nextErrors.capacity = "Enter a positive whole number.";
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

    const allowedStatuses = ["planned", "active", "completed", "cancelled"];

    if (!allowedStatuses.includes(form.status)) {
      nextErrors.status = "Invalid batch status.";
    }

    if (
      form.capacity !== "" &&
      Number(form.capacity) < Number(form.enrolledCount)
    ) {
      nextErrors.capacity = `Capacity cannot be lower than the current enrolled count (${form.enrolledCount}).`;
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
      days: form.days,
      capacity: form.capacity,
      fee: form.fee,
      courseId: form.courseId,
      trainerEmployeeId: form.trainerEmployeeId,
    });
  }

  return (
    <form className="batch-form" onSubmit={handleSubmit}>
      <div className="batch-form-grid">
        {mode !== "create" && (
          <div className="batch-field batch-field-full">
            <label htmlFor="batch-code">Batch Code</label>

            <input id="batch-code" value={form.batchCode} disabled readOnly />
          </div>
        )}

        <div className="batch-field batch-field-full">
          <label htmlFor="batch-name">Batch Name</label>

          <input
            id="batch-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. Full Stack Morning Batch"
          />

          {errors.name && <span className="batch-error">{errors.name}</span>}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-course">Course</label>

          <select
            id="batch-course"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
            disabled={readOnly || loading}
          >
            <option value="">Select course</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          {errors.courseId && (
            <span className="batch-error">{errors.courseId}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-trainer">Trainer</label>

          <select
            id="batch-trainer"
            value={form.trainerEmployeeId}
            onChange={(event) =>
              updateField("trainerEmployeeId", event.target.value)
            }
            disabled={readOnly || loading}
          >
            <option value="">Select trainer</option>

            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>

          {errors.trainerEmployeeId && (
            <span className="batch-error">{errors.trainerEmployeeId}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-start-date">Start Date</label>

          <input
            id="batch-start-date"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            disabled={readOnly || loading}
          />

          {errors.startDate && (
            <span className="batch-error">{errors.startDate}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-end-date">End Date</label>

          <input
            id="batch-end-date"
            type="date"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            disabled={readOnly || loading}
          />

          {errors.endDate && (
            <span className="batch-error">{errors.endDate}</span>
          )}
        </div>

        <div className="batch-field batch-field-full">
          <label>Days</label>

          <div className="batch-days">
            {DAYS.map((day) => {
              const selected = form.days.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  className={`batch-day-button ${
                    selected ? "batch-day-selected" : ""
                  }`}
                  onClick={() => toggleDay(day)}
                  disabled={readOnly || loading}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {errors.days && <span className="batch-error">{errors.days}</span>}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-start-time">Start Time</label>

          <input
            id="batch-start-time"
            type="time"
            value={form.startTime}
            onChange={(event) => updateField("startTime", event.target.value)}
            disabled={readOnly || loading}
          />

          {errors.startTime && (
            <span className="batch-error">{errors.startTime}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-end-time">End Time</label>

          <input
            id="batch-end-time"
            type="time"
            value={form.endTime}
            onChange={(event) => updateField("endTime", event.target.value)}
            disabled={readOnly || loading}
          />

          {errors.endTime && (
            <span className="batch-error">{errors.endTime}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-room">Room</label>

          <input
            id="batch-room"
            value={form.room}
            onChange={(event) => updateField("room", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. Lab 1"
          />

          {errors.room && <span className="batch-error">{errors.room}</span>}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-capacity">Capacity</label>

          <input
            id="batch-capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) => updateField("capacity", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. 30"
          />

          {errors.capacity && (
            <span className="batch-error">{errors.capacity}</span>
          )}
        </div>

        {mode !== "create" && (
          <div className="batch-field">
            <label htmlFor="batch-enrolled">Enrolled Students</label>

            <input
              id="batch-enrolled"
              value={form.enrolledCount}
              disabled
              readOnly
            />
          </div>
        )}

        <div className="batch-field">
          <label htmlFor="batch-fee">Fee</label>

          <input
            id="batch-fee"
            type="number"
            min="0"
            step="0.01"
            value={form.fee}
            onChange={(event) => updateField("fee", event.target.value)}
            disabled={readOnly || loading}
            placeholder="0"
          />

          {errors.fee && <span className="batch-error">{errors.fee}</span>}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-currency">Currency</label>

          <input
            id="batch-currency"
            value={form.currencyCode}
            maxLength={3}
            onChange={(event) =>
              updateField("currencyCode", event.target.value.toUpperCase())
            }
            disabled={readOnly || loading}
          />

          {errors.currencyCode && (
            <span className="batch-error">{errors.currencyCode}</span>
          )}
        </div>

        <div className="batch-field">
          <label htmlFor="batch-status">Status</label>

          <select
            id="batch-status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            disabled={readOnly || loading}
          >
            <option value="planned">Planned</option>

            <option value="active">Active</option>

            <option value="completed">Completed</option>

            <option value="cancelled">Cancelled</option>
          </select>

          {errors.status && (
            <span className="batch-error">{errors.status}</span>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="batch-form-actions">
          <button
            type="button"
            className="batch-secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="batch-primary-button"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : mode === "edit"
                ? "Update Batch"
                : "Create Batch"}
          </button>
        </div>
      )}

      {readOnly && (
        <div className="batch-form-actions">
          <button
            type="button"
            className="batch-primary-button"
            onClick={onCancel}
          >
            Close
          </button>
        </div>
      )}
    </form>
  );
}

export default BatchForm;
