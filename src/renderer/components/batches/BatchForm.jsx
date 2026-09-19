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
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    days: [],
  });

  const [errors, setErrors] = useState({});

  const readOnly = mode === "view";

  useEffect(() => {
    if (!batch) {
      setForm({
        ...EMPTY_FORM,
        days: [],
      });

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
      capacity:
        batch.capacity !== null && batch.capacity !== undefined
          ? String(batch.capacity)
          : "",
      fee:
        batch.feeMinor !== null && batch.feeMinor !== undefined
          ? String(batch.feeMinor / 100)
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
    } else if (form.name.trim().length > 150) {
      nextErrors.name = "Batch name must not exceed 150 characters.";
    }

    if (!form.courseId) {
      nextErrors.courseId = "Course is required.";
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

    if (form.capacity !== "") {
      const capacity = Number(form.capacity);

      if (!Number.isInteger(capacity) || capacity <= 0) {
        nextErrors.capacity = "Capacity must be a positive whole number.";
      }

      if (Number.isInteger(capacity) && capacity < Number(form.enrolledCount)) {
        nextErrors.capacity = `Capacity cannot be lower than the current enrolled count (${form.enrolledCount}).`;
      }
    }

    if (form.fee !== "") {
      const fee = Number(form.fee);

      if (Number.isNaN(fee) || fee < 0) {
        nextErrors.fee = "Fee must be zero or greater.";
      }
    }

    if (!/^[A-Z]{3}$/.test(form.currencyCode.trim().toUpperCase())) {
      nextErrors.currencyCode = "Use a 3-letter currency code.";
    }

    const allowedStatuses = ["planned", "active", "completed", "cancelled"];

    if (!allowedStatuses.includes(form.status)) {
      nextErrors.status = "Invalid batch status.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (readOnly) {
      return;
    }

    if (!validate()) {
      return;
    }

    await onSubmit({
      batchCode: form.batchCode,
      name: form.name.trim(),
      courseId: form.courseId,
      trainerEmployeeId: form.trainerEmployeeId,
      startDate: form.startDate,
      endDate: form.endDate,
      days: form.days,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room.trim(),
      capacity: form.capacity,
      fee: form.fee,
      currencyCode: form.currencyCode.trim().toUpperCase(),
      status: form.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {mode !== "create" && (
          <div className="md:col-span-2">
            <label
              htmlFor="batch-code"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Batch Code
            </label>

            <input
              id="batch-code"
              value={form.batchCode}
              disabled
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-700"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label
            htmlFor="batch-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Batch Name
          </label>

          <input
            id="batch-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. Full Stack Morning Batch"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-course"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Course
          </label>

          <select
            id="batch-course"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          >
            <option value="">Select course</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          {errors.courseId && (
            <p className="mt-1 text-xs text-red-600">{errors.courseId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-trainer"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Trainer
          </label>

          <select
            id="batch-trainer"
            value={form.trainerEmployeeId}
            onChange={(event) =>
              updateField("trainerEmployeeId", event.target.value)
            }
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          >
            <option value="">Not assigned</option>

            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>

          {errors.trainerEmployeeId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.trainerEmployeeId}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-start-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Start Date
          </label>

          <input
            id="batch-start-date"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-end-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            End Date
          </label>

          <input
            id="batch-end-date"
            type="date"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Class Days
          </label>

          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const selected = form.days.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  disabled={readOnly || loading}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {errors.days && (
            <p className="mt-1 text-xs text-red-600">{errors.days}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-start-time"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Start Time
          </label>

          <input
            id="batch-start-time"
            type="time"
            value={form.startTime}
            onChange={(event) => updateField("startTime", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.startTime && (
            <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-end-time"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            End Time
          </label>

          <input
            id="batch-end-time"
            type="time"
            value={form.endTime}
            onChange={(event) => updateField("endTime", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.endTime && (
            <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-room"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Room
          </label>

          <input
            id="batch-room"
            value={form.room}
            onChange={(event) => updateField("room", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. Lab 1"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.room && (
            <p className="mt-1 text-xs text-red-600">{errors.room}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-capacity"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Capacity
          </label>

          <input
            id="batch-capacity"
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={(event) => updateField("capacity", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. 30"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.capacity && (
            <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
          )}
        </div>

        {mode !== "create" && (
          <div>
            <label
              htmlFor="batch-enrolled"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Enrolled Students
            </label>

            <input
              id="batch-enrolled"
              value={form.enrolledCount}
              disabled
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-700"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="batch-fee"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Batch Fee
          </label>

          <input
            id="batch-fee"
            type="number"
            min="0"
            step="0.01"
            value={form.fee}
            onChange={(event) => updateField("fee", event.target.value)}
            disabled={readOnly || loading}
            placeholder="e.g. 25000"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.fee && (
            <p className="mt-1 text-xs text-red-600">{errors.fee}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-currency"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Currency
          </label>

          <input
            id="batch-currency"
            value={form.currencyCode}
            maxLength={3}
            onChange={(event) =>
              updateField(
                "currencyCode",
                event.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
              )
            }
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />

          {errors.currencyCode && (
            <p className="mt-1 text-xs text-red-600">{errors.currencyCode}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-status"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="batch-status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            disabled={readOnly || loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          >
            <option value="planned">Planned</option>

            <option value="active">Active</option>

            <option value="completed">Completed</option>

            <option value="cancelled">Cancelled</option>
          </select>

          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      )}
    </form>
  );
}

export default BatchForm;
