import { useEffect, useState } from "react";

import { createStudent, updateStudent } from "../../services/student.api";

import { listBatchCourses, listBatches } from "../../services/batch.api";

import { createAdmission } from "../../services/admission.api";

const EMPTY_FORM = {
  studentCode: "",
  firstName: "",
  lastName: "",
  guardianName: "",
  guardianPhone: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  status: "active",
  notes: "",

  courseId: "",
  batchId: "",
  enrolledAt: new Date().toISOString().slice(0, 10),
  agreedFee: "",
  discount: "",
  enrollmentStatus: "active",
  currencyCode: "PKR",
  enrollmentNotes: "",
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const ERROR_INPUT_CLASS =
  "w-full rounded-lg border border-rose-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function StudentForm({
  student = null,
  enrollment = null,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const isEditing = Boolean(student?.id);

  useEffect(() => {
    if (!student) {
      setForm({
        ...EMPTY_FORM,
        enrolledAt: new Date().toISOString().slice(0, 10),
      });

      setErrors({});
      setServerError("");
      return;
    }

    setForm({
      studentCode: student.student_code || "",
      firstName: student.first_name || "",
      lastName: student.last_name || "",
      guardianName: student.guardian_name || "",
      guardianPhone: student.guardian_phone || "",
      phone: student.phone || "",
      email: student.email || "",
      address: student.address || "",
      dateOfBirth: student.date_of_birth || "",
      status: student.status || "active",
      notes: student.notes || "",

      courseId: enrollment?.courseId ? String(enrollment.courseId) : "",
      batchId: enrollment?.batchId ? String(enrollment.batchId) : "",
      enrolledAt:
        enrollment?.enrolledAt || new Date().toISOString().slice(0, 10),
      agreedFee:
        enrollment?.agreedFeeMinor !== null &&
        enrollment?.agreedFeeMinor !== undefined
          ? String(Number(enrollment.agreedFeeMinor) / 100)
          : "",
      discount:
        enrollment?.discountMinor !== null &&
        enrollment?.discountMinor !== undefined
          ? String(Number(enrollment.discountMinor) / 100)
          : "",
      enrollmentStatus: enrollment?.status || "active",
      currencyCode: enrollment?.currencyCode || "PKR",
      enrollmentNotes: enrollment?.notes || "",
    });

    setErrors({});
    setServerError("");
  }, [student, enrollment]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoadingCourses(true);

      try {
        const result = await listBatchCourses();

        if (cancelled) return;

        if (!result.success) {
          setServerError(result.message || "Unable to load courses.");

          return;
        }

        setCourses(result.courses || []);
      } catch (error) {
        if (cancelled) return;

        console.error("[StudentForm] Failed to load courses:", error);

        setServerError("Unable to load courses.");
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.courseId) {
      setBatches([]);
      return;
    }

    let cancelled = false;

    async function loadBatches() {
      setLoadingBatches(true);

      try {
        const result = await listBatches({
          courseId: form.courseId,
          status: "all",
        });

        if (cancelled) return;

        if (!result.success) {
          setServerError(result.message || "Unable to load batches.");

          setBatches([]);
          return;
        }

        const availableBatches = (result.batches || []).filter(
          (batch) => batch.status === "planned" || batch.status === "active",
        );

        setBatches(availableBatches);
      } catch (error) {
        if (cancelled) return;

        console.error("[StudentForm] Failed to load batches:", error);

        setServerError("Unable to load batches.");

        setBatches([]);
      } finally {
        if (!cancelled) {
          setLoadingBatches(false);
        }
      }
    }

    loadBatches();

    return () => {
      cancelled = true;
    };
  }, [form.courseId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setServerError("");
  }

  function handleCourseChange(event) {
    const { value } = event.target;

    setForm((current) => ({
      ...current,
      courseId: value,
      batchId: "",
      agreedFee: "",
    }));

    setErrors((current) => ({
      ...current,
      courseId: "",
      batchId: "",
      agreedFee: "",
    }));

    setServerError("");
  }

  function handleBatchChange(event) {
    const { value } = event.target;

    const selectedBatch = batches.find(
      (batch) => String(batch.id) === String(value),
    );

    setForm((current) => ({
      ...current,
      batchId: value,
      agreedFee:
        selectedBatch?.feeMinor !== null &&
        selectedBatch?.feeMinor !== undefined
          ? (Number(selectedBatch.feeMinor) / 100).toString()
          : current.agreedFee,
      currencyCode:
        selectedBatch?.currencyCode || current.currencyCode || "PKR",
    }));

    setErrors((current) => ({
      ...current,
      batchId: "",
      agreedFee: "",
    }));

    setServerError("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.studentCode.trim()) {
      nextErrors.studentCode = "Student ID is required.";
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!form.guardianName.trim()) {
      nextErrors.guardianName = "Guardian/father name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (!isEditing) {
      if (!form.courseId) {
        nextErrors.courseId = "Course is required.";
      }

      // if (!form.batchId) {
      //   nextErrors.batchId = "Batch is required.";
      // }

      if (!form.enrolledAt) {
        nextErrors.enrolledAt = "Admission date is required.";
      }

      if (
        form.agreedFee === "" ||
        form.agreedFee === null ||
        form.agreedFee === undefined
      ) {
        nextErrors.agreedFee = "Agreed fee is required.";
      } else if (
        Number.isNaN(Number(form.agreedFee)) ||
        Number(form.agreedFee) < 0
      ) {
        nextErrors.agreedFee = "Agreed fee must be zero or greater.";
      }

      if (
        form.discount !== "" &&
        (Number.isNaN(Number(form.discount)) || Number(form.discount) < 0)
      ) {
        nextErrors.discount = "Discount must be zero or greater.";
      }

      if (
        form.discount !== "" &&
        form.agreedFee !== "" &&
        Number(form.discount) > Number(form.agreedFee)
      ) {
        nextErrors.discount = "Discount cannot be greater than the agreed fee.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      if (isEditing) {
        const result = await updateStudent(student.id, {
          studentCode: form.studentCode,
          firstName: form.firstName,
          lastName: form.lastName,
          guardianName: form.guardianName,
          guardianPhone: form.guardianPhone,
          phone: form.phone,
          email: form.email,
          address: form.address,
          dateOfBirth: form.dateOfBirth,
          status: form.status,
          notes: form.notes,

          courseId: form.courseId,
          batchId: form.batchId || null,
          enrolledAt: form.enrolledAt,
          agreedFeeMinor:
            form.agreedFee === ""
              ? 0
              : Math.round(Number(form.agreedFee) * 100),
          discountMinor:
            form.discount === "" ? 0 : Math.round(Number(form.discount) * 100),
          enrollmentStatus: form.enrollmentStatus,
          currencyCode: form.currencyCode,
          enrollmentNotes: form.enrollmentNotes,
        });

        if (!result.success) {
          if (result.code === "VALIDATION_ERROR" && result.details) {
            setErrors(result.details);
            return;
          }

          setServerError(result.message || "Unable to update student.");

          return;
        }

        onSuccess(result.student);
        return;
      }

      const result = await createAdmission({
        studentCode: form.studentCode,
        firstName: form.firstName,
        lastName: form.lastName,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        phone: form.phone,
        email: form.email,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        status: form.status,
        notes: form.notes,

        courseId: form.courseId,
        batchId: form.batchId || null,
        enrolledAt: form.enrolledAt,
        agreedFeeMinor: Math.round(Number(form.agreedFee) * 100),
        discountMinor:
          form.discount === "" ? 0 : Math.round(Number(form.discount) * 100),
        enrollmentStatus: form.enrollmentStatus,
        currencyCode: form.currencyCode,
        enrollmentNotes: form.enrollmentNotes,
      });

      if (!result.success) {
        if (result.code === "VALIDATION_ERROR" && result.details) {
          const admissionErrors = {
            ...result.details,
          };

          if (admissionErrors.agreedFeeMinor) {
            admissionErrors.agreedFee = admissionErrors.agreedFeeMinor;
          }

          if (admissionErrors.discountMinor) {
            admissionErrors.discount = admissionErrors.discountMinor;
          }

          setErrors(admissionErrors);
          return;
        }

        setServerError(result.message || "Unable to admit student.");

        return;
      }

      onSuccess(result.student);
    } catch (error) {
      console.error("[StudentForm] Submit failed:", error);

      setServerError("Something went wrong while saving the student.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderFieldError(field) {
    if (!errors[field]) return null;

    return (
      <p className="mt-1.5 text-xs font-medium text-rose-600">
        {errors[field]}
      </p>
    );
  }

  const selectedBatch = batches.find(
    (batch) => String(batch.id) === String(form.batchId),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">
            !
          </div>

          <div>
            <p className="font-medium">Unable to save student</p>

            <p className="mt-0.5 text-rose-600">{serverError}</p>
          </div>
        </div>
      )}

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Basic Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Enter the student's identification and personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="studentCode"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Student ID
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="studentCode"
              name="studentCode"
              value={form.studentCode}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. STU-001"
              autoComplete="off"
              className={errors.studentCode ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("studentCode")}
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Status
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={submitting}
              className={errors.status ? ERROR_INPUT_CLASS : INPUT_CLASS}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            {renderFieldError("status")}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              First Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter first name"
              autoComplete="given-name"
              className={errors.firstName ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("firstName")}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Last Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter last name"
              autoComplete="family-name"
              className={errors.lastName ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("lastName")}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Date of Birth
            </label>

            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              disabled={submitting}
              className={errors.dateOfBirth ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("dateOfBirth")}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Contact & Guardian Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Add the student's contact details and guardian information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="guardianName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Guardian / Father Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="guardianName"
              name="guardianName"
              value={form.guardianName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter guardian name"
              autoComplete="name"
              className={errors.guardianName ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("guardianName")}
          </div>

          <div>
            <label
              htmlFor="guardianPhone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Guardian Phone
            </label>

            <input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              value={form.guardianPhone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. 0300 1234567"
              autoComplete="tel"
              className={errors.guardianPhone ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("guardianPhone")}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Student Phone
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. 0300 1234567"
              autoComplete="tel"
              className={errors.phone ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("phone")}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              placeholder="student@example.com"
              autoComplete="email"
              className={errors.email ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />

            {renderFieldError("email")}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter residential address"
              rows={3}
              className={`resize-y ${
                errors.address ? ERROR_INPUT_CLASS : INPUT_CLASS
              }`}
            />

            {renderFieldError("address")}
          </div>
        </div>
      </section>

      <>
        <div className="border-t border-slate-200" />

        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Admission</h3>

            <p className="mt-1 text-xs text-slate-500">
              Select the course and batch and set the student's admission fee.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="courseId"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Course
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <select
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleCourseChange}
                disabled={submitting || loadingCourses}
                className={errors.courseId ? ERROR_INPUT_CLASS : INPUT_CLASS}
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select course"}
                </option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} — {course.name}
                  </option>
                ))}
              </select>

              {renderFieldError("courseId")}
            </div>

            <div>
              <label
                htmlFor="batchId"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Batch
              </label>

              <select
                id="batchId"
                name="batchId"
                value={form.batchId}
                onChange={handleBatchChange}
                disabled={submitting || !form.courseId || loadingBatches}
                className={errors.batchId ? ERROR_INPUT_CLASS : INPUT_CLASS}
              >
                <option value="">
                  {!form.courseId
                    ? "Select a course first"
                    : loadingBatches
                      ? "Loading batches..."
                      : "No batch selected"}
                </option>

                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchCode} — {batch.name}
                  </option>
                ))}
              </select>

              {renderFieldError("batchId")}
            </div>

            <div>
              <label
                htmlFor="enrolledAt"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Admission Date
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <input
                id="enrolledAt"
                name="enrolledAt"
                type="date"
                value={form.enrolledAt}
                onChange={handleChange}
                disabled={submitting}
                className={errors.enrolledAt ? ERROR_INPUT_CLASS : INPUT_CLASS}
              />

              {renderFieldError("enrolledAt")}
            </div>

            <div>
              <label
                htmlFor="enrollmentStatus"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Enrollment Status
              </label>

              <select
                id="enrollmentStatus"
                name="enrollmentStatus"
                value={form.enrollmentStatus}
                onChange={handleChange}
                disabled={submitting}
                className={INPUT_CLASS}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="agreedFee"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Agreed Fee
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <input
                id="agreedFee"
                name="agreedFee"
                type="number"
                min="0"
                step="0.01"
                value={form.agreedFee}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. 25000"
                className={errors.agreedFee ? ERROR_INPUT_CLASS : INPUT_CLASS}
              />

              {selectedBatch?.feeMinor !== null &&
                selectedBatch?.feeMinor !== undefined && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Batch fee: {form.currencyCode}{" "}
                    {(Number(selectedBatch.feeMinor) / 100).toLocaleString()}
                  </p>
                )}

              {renderFieldError("agreedFee")}
            </div>

            <div>
              <label
                htmlFor="discount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Discount
              </label>

              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. 2000"
                className={errors.discount ? ERROR_INPUT_CLASS : INPUT_CLASS}
              />

              {renderFieldError("discount")}
            </div>

            <div>
              <label
                htmlFor="currencyCode"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Currency
              </label>

              <input
                id="currencyCode"
                name="currencyCode"
                value={form.currencyCode}
                onChange={handleChange}
                disabled={submitting}
                maxLength={3}
                className={INPUT_CLASS}
              />

              {renderFieldError("currencyCode")}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="enrollmentNotes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Admission Notes
              </label>

              <textarea
                id="enrollmentNotes"
                name="enrollmentNotes"
                value={form.enrollmentNotes}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Add admission-specific notes..."
                rows={3}
                className={`resize-y ${
                  errors.enrollmentNotes ? ERROR_INPUT_CLASS : INPUT_CLASS
                }`}
              />

              {renderFieldError("enrollmentNotes")}
            </div>

            {selectedBatch && (
              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Batch</p>
                    <p className="mt-0.5 font-medium text-slate-900">
                      {selectedBatch.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Schedule</p>
                    <p className="mt-0.5 font-medium text-slate-900">
                      {selectedBatch.days?.join(", ") || "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Seats</p>
                    <p className="mt-0.5 font-medium text-slate-900">
                      {selectedBatch.capacity
                        ? `${selectedBatch.enrolledCount} / ${selectedBatch.capacity}`
                        : `${selectedBatch.enrolledCount} enrolled`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Additional Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Add any useful notes about this student.
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Add notes, remarks or additional information..."
            rows={4}
            className={`resize-y ${
              errors.notes ? ERROR_INPUT_CLASS : INPUT_CLASS
            }`}
          />

          {renderFieldError("notes")}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {isEditing ? "Saving..." : "Admitting..."}
            </>
          ) : isEditing ? (
            "Update Student"
          ) : (
            "Admit Student"
          )}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
