import { useEffect, useMemo, useState } from "react";

import Can from "../authorization/Can";
import { PERMISSIONS } from "../authorization/permissions";

import BatchForm from "../components/batches/BatchForm";

import {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  listBatchCourses,
  listBatchTrainers,
} from "../services/batch.api";

const EMPTY_STATE = {
  loading: true,
  error: "",
};

function formatFee(batch) {
  if (batch.feeMinor === null || batch.feeMinor === undefined) {
    return "—";
  }

  return `${batch.currencyCode || "PKR"} ${(
    batch.feeMinor / 100
  ).toLocaleString()}`;
}

function formatSchedule(batch) {
  const days =
    Array.isArray(batch.days) && batch.days.length
      ? batch.days.join(", ")
      : "—";

  if (!batch.startTime || !batch.endTime) {
    return days;
  }

  return (
    <>
      <span>{days}</span>

      <small className="block text-xs text-slate-500">
        {batch.startTime} - {batch.endTime}
      </small>
    </>
  );
}

function formatStatus(status) {
  if (!status) {
    return "—";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function BatchesPage({ user }) {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [state, setState] = useState(EMPTY_STATE);
  const [actionError, setActionError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [trainerEmployeeId, setTrainerEmployeeId] = useState("all");
  const [status, setStatus] = useState("all");

  const [modal, setModal] = useState({
    open: false,
    mode: null,
    batch: null,
  });

  async function loadBatches() {
    setState({
      loading: true,
      error: "",
    });

    try {
      const response = await listBatches({
        search,
        courseId,
        trainerEmployeeId,
        status,
      });

      if (!response.success) {
        setState({
          loading: false,
          error: response.message || "Failed to load batches.",
        });

        return;
      }

      setBatches(response.batches || []);

      setState({
        loading: false,
        error: "",
      });
    } catch (error) {
      console.error("Failed to load batches:", error);

      setState({
        loading: false,
        error: "Failed to load batches.",
      });
    }
  }

  async function loadBatchOptions() {
    try {
      const [coursesResponse, trainersResponse] = await Promise.all([
        listBatchCourses(),
        listBatchTrainers(),
      ]);

      if (coursesResponse.success) {
        setCourses(coursesResponse.courses || []);
      }

      if (trainersResponse.success) {
        setTrainers(trainersResponse.trainers || []);
      }
    } catch (error) {
      console.error("Failed to load batch options:", error);
    }
  }

  useEffect(() => {
    loadBatches();
  }, [search, courseId, trainerEmployeeId, status]);

  useEffect(() => {
    loadBatchOptions();
  }, []);

  const plannedCount = useMemo(
    () => batches.filter((batch) => batch.status === "planned").length,
    [batches],
  );

  const activeCount = useMemo(
    () => batches.filter((batch) => batch.status === "active").length,
    [batches],
  );

  const completedCount = useMemo(
    () => batches.filter((batch) => batch.status === "completed").length,
    [batches],
  );

  function openCreate() {
    setActionError("");

    setModal({
      open: true,
      mode: "create",
      batch: null,
    });
  }

  async function openView(batch) {
    setActionError("");

    try {
      const response = await getBatch(batch.id);

      if (!response.success) {
        setActionError(response.message || "Failed to load batch.");

        return;
      }

      setModal({
        open: true,
        mode: "view",
        batch: response.batch,
      });
    } catch (error) {
      console.error("Failed to load batch:", error);

      setActionError("Failed to load batch.");
    }
  }

  async function openEdit(batch) {
    setActionError("");

    try {
      const response = await getBatch(batch.id);

      if (!response.success) {
        setActionError(response.message || "Failed to load batch.");

        return;
      }

      setModal({
        open: true,
        mode: "edit",
        batch: response.batch,
      });
    } catch (error) {
      console.error("Failed to load batch:", error);

      setActionError("Failed to load batch.");
    }
  }

  function closeModal() {
    if (formLoading) {
      return;
    }

    setModal({
      open: false,
      mode: null,
      batch: null,
    });

    setActionError("");
  }

  async function handleSubmit(formData) {
    setFormLoading(true);
    setActionError("");

    try {
      let response;

      if (modal.mode === "edit") {
        response = await updateBatch(modal.batch.id, formData);
      } else {
        response = await createBatch(formData);
      }

      if (!response.success) {
        setActionError(response.message || "Batch operation failed.");

        return;
      }

      setModal({
        open: false,
        mode: null,
        batch: null,
      });

      await loadBatches();
    } catch (error) {
      console.error("Batch operation failed:", error);

      setActionError(error.message || "Batch operation failed.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-500">
            ACADEMY
          </span>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Batches
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage class schedules, trainers, rooms, capacity and batch fees.
          </p>
        </div>

        <Can user={user} permission={PERMISSIONS.ACADEMY_BATCHES_MANAGE}>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            + New Batch
          </button>
        </Can>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm text-slate-500">Total Batches</span>

          <strong className="mt-2 block text-2xl font-semibold text-slate-900">
            {batches.length}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm text-slate-500">Planned</span>

          <strong className="mt-2 block text-2xl font-semibold text-slate-900">
            {plannedCount}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm text-slate-500">Active</span>

          <strong className="mt-2 block text-2xl font-semibold text-slate-900">
            {activeCount}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm text-slate-500">Completed</span>

          <strong className="mt-2 block text-2xl font-semibold text-slate-900">
            {completedCount}
          </strong>
        </div>
      </section>

      <section className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search batches, courses or trainers..."
        />

        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
        >
          <option value="all">All Courses</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          value={trainerEmployeeId}
          onChange={(event) => setTrainerEmployeeId(event.target.value)}
        >
          <option value="all">All Trainers</option>

          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {state.loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <strong className="text-sm font-semibold text-slate-900">
              No batches found.
            </strong>

            <span className="mt-1 text-sm text-slate-500">
              Create a batch to start scheduling classes.
            </span>

            <Can user={user} permission={PERMISSIONS.ACADEMY_BATCHES_MANAGE}>
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + New Batch
              </button>
            </Can>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Batch
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Course
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Trainer
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Schedule
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fee
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr key={batch.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <strong className="text-sm font-semibold text-slate-900">
                          {batch.name}
                        </strong>

                        <span className="mt-0.5 text-xs text-slate-500">
                          {batch.batchCode}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <strong className="text-sm font-medium text-slate-800">
                          {batch.courseName || "—"}
                        </strong>

                        <span className="mt-0.5 text-xs text-slate-500">
                          {batch.courseCode || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {batch.trainerName ? (
                        <div className="flex flex-col">
                          <strong className="text-sm font-medium text-slate-800">
                            {batch.trainerName}
                          </strong>

                          <span className="mt-0.5 text-xs text-slate-500">
                            {batch.trainerEmployeeCode || "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-slate-700">
                        {formatSchedule(batch)}

                        {batch.room && (
                          <small className="mt-0.5 text-xs text-slate-500">
                            {batch.room}
                          </small>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-slate-700">
                        <span>{batch.startDate || "—"}</span>

                        {batch.endDate && (
                          <small className="mt-0.5 text-xs text-slate-500">
                            to {batch.endDate}
                          </small>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <strong className="text-sm font-medium text-slate-800">
                          {batch.enrolledCount}

                          {batch.capacity !== null &&
                            batch.capacity !== undefined &&
                            ` / ${batch.capacity}`}
                        </strong>

                        <small className="mt-0.5 text-xs text-slate-500">
                          enrolled
                        </small>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {formatFee(batch)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {formatStatus(batch.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openView(batch)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          View
                        </button>

                        <Can
                          user={user}
                          permission={PERMISSIONS.ACADEMY_BATCHES_MANAGE}
                        >
                          <button
                            type="button"
                            onClick={() => openEdit(batch)}
                            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                          >
                            Edit
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !formLoading) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-500">
                  BATCH
                </span>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {modal.mode === "create"
                    ? "Create Batch"
                    : modal.mode === "edit"
                      ? "Edit Batch"
                      : "Batch Details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <BatchForm
              batch={modal.batch}
              mode={modal.mode}
              courses={courses}
              trainers={trainers}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default BatchesPage;
