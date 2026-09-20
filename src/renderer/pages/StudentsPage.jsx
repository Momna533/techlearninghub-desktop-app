import { useEffect, useState } from "react";

import {
  listStudents,
  getStudent,
  deactivateStudent,
} from "../services/student.api";

import StudentForm from "../components/students/StudentForm";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setError("");

    const result = await listStudents({
      search,
      status,
    });

    if (!result.success) {
      setError(result.message || "Failed to load students.");
      setStudents([]);
      setLoading(false);
      return;
    }

    setStudents(result.students);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, [search, status]);

  function handleCreate() {
    setEditingStudent(null);
    setSelectedStudent(null);
    setShowForm(true);
    setError("");
  }

  async function handleEdit(student) {
    setError("");

    try {
      const result = await getStudent(student.id);

      if (!result.success) {
        setError(result.message || "Unable to load student.");
        return;
      }

      setEditingStudent(result);
      setSelectedStudent(null);
      setShowForm(true);
    } catch (error) {
      console.error("[StudentsPage] Failed to load student:", error);
      setError("Unable to load student.");
    }
  }

  async function handleView(studentId) {
    setLoadingStudent(true);
    setError("");

    const result = await getStudent(studentId);

    setLoadingStudent(false);

    if (!result.success) {
      setError(result.message || "Failed to load student.");
      return;
    }

    setSelectedStudent(result.student);
    setShowForm(false);
  }

  async function handleDeactivate(id) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this student?",
    );

    if (!confirmed) return;

    setError("");

    const result = await deactivateStudent(id);

    if (!result.success) {
      setError(result.message || "Failed to deactivate student.");
      return;
    }

    await loadStudents();

    if (selectedStudent?.id === id) {
      setSelectedStudent(result.student);
    }
  }

  async function handleFormSuccess() {
    setShowForm(false);
    setEditingStudent(null);
    setError("");

    await loadStudents();
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingStudent(null);
  }

  function handleCloseStudent() {
    setSelectedStudent(null);
  }

  function getStatusClasses(studentStatus) {
    switch (studentStatus) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";

      case "inactive":
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";

      case "graduated":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";

      case "withdrawn":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
    }
  }

  function formatStatus(studentStatus) {
    return studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1);
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Academy</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage student records and academy information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:w-auto"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Student
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="mt-0.5 font-semibold">!</span>

            <p>{error}</p>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full lg:flex-1">
              <label
                htmlFor="student-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <input
                id="student-search"
                type="search"
                placeholder="Search by ID, name, phone, email or guardian..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="student-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="student-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All statuses</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>

                <option value="graduated">Graduated</option>

                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </section>

        {loadingStudent && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
            Loading student...
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Student Records
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {students.length}{" "}
                {students.length === 1 ? "student" : "students"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

              <p className="mt-3 text-sm text-slate-500">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                —
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No students found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {search || status !== "all"
                  ? "Try changing your search or filter."
                  : "Add your first student to get started."}
              </p>

              {!search && status === "all" && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add Student
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Guardian
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registered
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {student.first_name?.charAt(0)}
                              {student.last_name?.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {student.first_name} {student.last_name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {student.student_code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {student.guardian_name}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {student.phone}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(student.status)}`}
                          >
                            {formatStatus(student.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {formatDate(student.joined_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleView(student.id)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(student)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeactivate(student.id)}
                              disabled={student.status === "inactive"}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 md:hidden">
                {students.map((student) => (
                  <div key={student.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {student.first_name?.charAt(0)}
                          {student.last_name?.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.student_code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(student.status)}`}
                      >
                        {formatStatus(student.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Guardian</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {student.guardian_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Phone</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {student.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Registered</p>

                        <p className="mt-0.5 text-sm text-slate-700">
                          {formatDate(student.joined_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Email</p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {student.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleView(student.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(student.id)}
                        disabled={student.status === "inactive"}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

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
            aria-labelledby="student-form-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="student-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingStudent ? "Edit Student" : "Add Student"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingStudent
                    ? "Update the student information below."
                    : "Enter the student information below."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <StudentForm
                student={editingStudent?.student || null}
                enrollment={editingStudent?.student?.enrollment || null}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) { handleCloseStudent(); } }} > <div role="dialog" aria-modal="true" aria-labelledby="student-view-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" > <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6"> <div className="flex items-center gap-4"> <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700"> {selectedStudent.first_name?.charAt(0)} {selectedStudent.last_name?.charAt(0)} </div> <div> <div className="flex flex-wrap items-center gap-2"> <h2 id="student-view-title" className="text-lg font-semibold text-slate-900" > {selectedStudent.first_name} {selectedStudent.last_name} </h2> <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(selectedStudent.status)}`} > {formatStatus(selectedStudent.status)} </span> </div> <p className="mt-1 text-sm text-slate-500"> {selectedStudent.student_code} </p> </div> </div> <button type="button" onClick={handleCloseStudent} className="self-start flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200" aria-label="Close" > × </button> </div> <div className="space-y-8 px-5 py-6 sm:px-6"> {/* Student Information */} <section> <div className="mb-4"> <h3 className="text-sm font-semibold text-slate-900"> Student Information </h3> <p className="mt-0.5 text-xs text-slate-500"> Personal and contact information. </p> </div> <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Guardian </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.guardian_name || "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Student Phone </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.phone || "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Guardian Phone </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.guardian_phone || "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Email </p> <p className="mt-1 break-words text-sm text-slate-900"> {selectedStudent.email || "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Date of Birth </p> <p className="mt-1 text-sm text-slate-900"> {formatDate(selectedStudent.date_of_birth)} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Registration Date </p> <p className="mt-1 text-sm text-slate-900"> {formatDate(selectedStudent.joined_at)} </p> </div> <div className="sm:col-span-2 lg:col-span-3"> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Address </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.address || "-"} </p> </div> <div className="sm:col-span-2 lg:col-span-3"> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Notes </p> <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900"> {selectedStudent.notes || "-"} </p> </div> </div> </section> {/* Admission Information */} <section className="border-t border-slate-200 pt-7"> <div className="mb-4"> <h3 className="text-sm font-semibold text-slate-900"> Admission Information </h3> <p className="mt-0.5 text-xs text-slate-500"> Course, batch, fees and enrollment details. </p> </div> {selectedStudent.enrollment ? ( <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Course </p> <p className="mt-1 text-sm font-medium text-slate-900"> {selectedStudent.enrollment.courseName || "-"} </p> {selectedStudent.enrollment.courseCode && ( <p className="mt-0.5 text-xs text-slate-500"> {selectedStudent.enrollment.courseCode} </p> )} </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Batch </p> <p className="mt-1 text-sm font-medium text-slate-900"> {selectedStudent.enrollment.batchName || "Not assigned"} </p> {selectedStudent.enrollment.batchCode && ( <p className="mt-0.5 text-xs text-slate-500"> {selectedStudent.enrollment.batchCode} </p> )} </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Trainer </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.enrollment.trainerName || "Not assigned"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Admission Date </p> <p className="mt-1 text-sm text-slate-900"> {formatDate(selectedStudent.enrollment.enrolledAt)} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Enrollment Status </p> <p className="mt-1"> <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700"> {formatStatus(selectedStudent.status) || "-"} </span> </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Currency </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.enrollment.currencyCode || "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Agreed Fee </p> <p className="mt-1 text-sm font-medium text-slate-900"> {selectedStudent.enrollment.agreedFeeMinor !== null && selectedStudent.enrollment.agreedFeeMinor !== undefined ? Number( selectedStudent.enrollment.agreedFeeMinor, ) / 100 : "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Discount </p> <p className="mt-1 text-sm text-slate-900"> {selectedStudent.enrollment.discountMinor !== null && selectedStudent.enrollment.discountMinor !== undefined ? Number( selectedStudent.enrollment.discountMinor, ) / 100 : "-"} </p> </div> <div> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Final Fee </p> <p className="mt-1 text-sm font-semibold text-slate-900"> {selectedStudent.enrollment.agreedFeeMinor !== null && selectedStudent.enrollment.agreedFeeMinor !== undefined ? ( (Number( selectedStudent.enrollment.agreedFeeMinor, ) - Number( selectedStudent.enrollment.discountMinor || 0, )) / 100 ).toLocaleString() : "-"} </p> </div> <div className="sm:col-span-2 lg:col-span-3"> <p className="text-xs font-medium uppercase tracking-wide text-slate-400"> Admission Notes </p> <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900"> {selectedStudent.enrollment.notes || "-"} </p> </div> </div> ) : ( <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4"> <p className="text-sm text-slate-500"> No admission information is available for this student. </p> </div> )} </section> </div> <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"> <button type="button" onClick={() => handleEdit(selectedStudent)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" > Edit Student </button> <button type="button" onClick={() => handleDeactivate(selectedStudent.id)} disabled={selectedStudent.status === "inactive"} className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40" > Deactivate </button> </div> </div> </div>
      )}
    </div>
  );
}

export default StudentsPage;
