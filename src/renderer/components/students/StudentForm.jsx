import { useEffect, useState } from "react";

import { createStudent, updateStudent } from "../../services/student.api";

import { listBatchCourses, listBatches } from "../../services/batch.api";

import { createAdmission } from "../../services/admission.api";

import {  createStudentPayment, getStudentPaymentSummary, listStudentPayments, } from "../../services/student-payment.api";

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

  registrationFee: "",
  registrationPayment: "",
  registrationPaymentMethod: "cash",

  coursePayment: "",
  coursePaymentMethod: "cash",

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
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
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

registrationFee:
  enrollment?.registrationFeeMinor !== null &&
  enrollment?.registrationFeeMinor !== undefined
    ? String(Number(enrollment.registrationFeeMinor) / 100)
    : "",

registrationPayment: "",

registrationPaymentMethod: "cash",

coursePayment: "",
coursePaymentMethod: "cash",

enrollmentStatus: enrollment?.status || "active",
    });

    setErrors({});
    setServerError("");
  }, [student, enrollment]);

useEffect(() => {
  let cancelled = false;

  async function loadPaymentSummary() {
    if (!student?.id || !enrollment?.id) {
      setPaymentSummary(null);
      return;
    }

    try {
      const result = await getStudentPaymentSummary(enrollment.id);

      if (cancelled) return;

      console.log("[StudentForm] Payment summary:", result);

      setPaymentSummary(result);
    } catch (error) {
      if (cancelled) return;

      console.error(
        "[StudentForm] Failed to load payment summary:",
        error,
      );

      setPaymentSummary(null);
    }
  }

  loadPaymentSummary();

  return () => {
    cancelled = true;
  };
}, [student, enrollment]);


useEffect(() => {
  let cancelled = false;

  async function loadPaymentHistory() {
    if (!student?.id || !enrollment?.id) {
      setPaymentHistory([]);
      return;
    }

    try {
      const result = await listStudentPayments(enrollment.id);

      if (cancelled) return;

      console.log("[StudentForm] Payment history:", result);

      setPaymentHistory(result?.payments || []);
    } catch (error) {
      if (cancelled) return;

      console.error(
        "[StudentForm] Failed to load payment history:",
        error,
      );

      setPaymentHistory([]);
    }
  }

  loadPaymentHistory();

  return () => {
    cancelled = true;
  };
}, [student, enrollment]);


useEffect(() => {
  if (!isEditing || !paymentSummary?.summary) {
    return;
  }

  setForm((current) => ({
    ...current,
    registrationPayment:
      Number(paymentSummary.summary.registrationPaidMinor || 0) / 100,
  }));
}, [isEditing, paymentSummary]);


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


      const registrationFee = Number(form.registrationFee);
const registrationPayment = Number(form.registrationPayment);

if (
  form.registrationFee === "" ||
  !Number.isFinite(registrationFee) ||
  registrationFee <= 0
) {
  nextErrors.registrationFee = "Registration fee is required.";
}

if (
  form.registrationPayment === "" ||
  !Number.isFinite(registrationPayment) ||
  registrationPayment <= 0
) {
  nextErrors.registrationPayment =
    "Registration payment is required.";
} else if (
  Number.isFinite(registrationFee) &&
  registrationPayment !== registrationFee
) {
  nextErrors.registrationPayment =
    "Registration payment must fully pay the registration fee.";
}

if (!form.registrationPaymentMethod) {
  nextErrors.registrationPaymentMethod =
    "Registration payment method is required.";
}

const coursePayment =
  form.coursePayment === "" ? 0 : Number(form.coursePayment);

const courseTotal =
  Number(form.agreedFee || 0) -
  Number(form.discount || 0);

if (!Number.isFinite(coursePayment) || coursePayment < 0) {
  nextErrors.coursePayment =
    "Course payment cannot be negative.";
} else if (coursePayment > courseTotal) {
  nextErrors.coursePayment =
    "Course payment cannot exceed the remaining course fee.";
}

if (coursePayment > 0 && !form.coursePaymentMethod) {
  nextErrors.coursePaymentMethod =
    "Payment method is required when a course payment is entered.";
}
    }

    return nextErrors;
  }

  const handleRecordCoursePayment = async () => {
  if (!enrollment?.id) {
    setServerError("No enrollment found for this student.");
    return;
  }

  const amount = Number(form.coursePayment);

  if (!Number.isFinite(amount) || amount <= 0) {
    setErrors((current) => ({
      ...current,
      coursePayment: "Enter a valid payment amount.",
    }));
    return;
  }

  if (!form.coursePaymentMethod) {
    setErrors((current) => ({
      ...current,
      coursePaymentMethod: "Select a payment method.",
    }));
    return;
  }

  setSubmitting(true);
  setServerError("");

  try {
    const result = await createStudentPayment({
      enrollmentId: enrollment.id,
      feeType: "course",
      amountMinor: Math.round(amount * 100),
      currencyCode: form.currencyCode || "PKR",
      paymentMethod: form.coursePaymentMethod,
      paidAt: new Date().toISOString(),
    });

    if (!result?.success) {
      throw new Error(result?.message || "Failed to record payment.");
    }

    setForm((current) => ({
      ...current,
      coursePayment: "",
      coursePaymentMethod: "cash",
    }));

    const [summaryResult, historyResult] = await Promise.all([
      getStudentPaymentSummary(enrollment.id),
      listStudentPayments(enrollment.id),
    ]);

    setPaymentSummary(summaryResult);
    setPaymentHistory(historyResult?.payments || []);
  } catch (error) {
    console.error(
      "[StudentForm] Failed to record course payment:",
      error,
    );

    setServerError(
      error?.message || "Failed to record course payment.",
    );
  } finally {
    setSubmitting(false);
  }
};

  async function handleSubmit(event) {
  console.log("SUBMIT HANDLER FIRED");

  event.preventDefault();

  console.log("AFTER PREVENT DEFAULT");

  setServerError("");

    const validationErrors = validate();
    console.log("VALIDATION ERRORS:", validationErrors);

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
        registrationFeeMinor:
  form.registrationFee === ""
    ? 0
    : Math.round(Number(form.registrationFee) * 100),


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

if (result.enrollment?.id) {
  const [summaryResult, historyResult] = await Promise.all([
    getStudentPaymentSummary(result.enrollment.id),
    listStudentPayments(result.enrollment.id),
  ]);

  setPaymentSummary(summaryResult);
  setPaymentHistory(historyResult?.payments || []);
}

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

registrationFeeMinor:
  Math.round(Number(form.registrationFee) * 100),

registrationPaymentMinor:
  Math.round(Number(form.registrationPayment) * 100),

registrationPaymentMethod:
  form.registrationPaymentMethod,

coursePaymentMinor:
  form.coursePayment === ""
    ? 0
    : Math.round(Number(form.coursePayment) * 100),

coursePaymentMethod:
  form.coursePayment > 0
    ? form.coursePaymentMethod
    : null,
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
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Server Error */}
    {serverError && (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
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

    {/* =========================================================
        1. BASIC INFORMATION
    ========================================================= */}
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Basic Information
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Student identification and personal details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Student ID */}
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
            className={
              errors.studentCode ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
          />

          {renderFieldError("studentCode")}
        </div>

        {/* Status */}
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

        {/* First Name */}
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
            className={
              errors.firstName ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
          />

          {renderFieldError("firstName")}
        </div>

        {/* Last Name */}
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
            className={
              errors.lastName ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
          />

          {renderFieldError("lastName")}
        </div>

        {/* Date of Birth */}
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
            className={
              errors.dateOfBirth ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
          />

          {renderFieldError("dateOfBirth")}
        </div>
      </div>
    </section>

    {/* =========================================================
        2. CONTACT INFORMATION
    ========================================================= */}
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Contact Information
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Student contact and residential details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Phone */}
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

        {/* Email */}
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

        {/* Address */}
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

    {/* =========================================================
        3. ADMISSION & ENROLLMENT
    ========================================================= */}
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Admission & Enrollment
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Assign the student to a course and batch and configure the
          enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Course */}
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
            className={
              errors.courseId ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
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

        {/* Batch */}
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

        {/* Admission Date */}
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
            className={
              errors.enrolledAt ? ERROR_INPUT_CLASS : INPUT_CLASS
            }
          />

          {renderFieldError("enrolledAt")}
        </div>

        {/* Enrollment Status */}
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


        {/* Batch Info */}
        {selectedBatch && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
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

    {/* =========================================================
        4. FEES & PAYMENTS
    ========================================================= */}
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Fees & Payments
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Configure fees, record payments, and review the student's
          payment balance.
        </p>
      </div>

      {/* Fee Configuration */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Fee Configuration
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Total Fee */}
          <div>
            <label
              htmlFor="agreedFee"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Total Course Fee
              <span className="ml-1 text-rose-500">*</span>
            </label>

<input
  id="agreedFee"
  name="agreedFee"
  type="text"
  inputMode="decimal"
  value={form.agreedFee}
  onChange={handleChange}
  onWheel={(event) => event.currentTarget.blur()}
  disabled={submitting}
  placeholder="e.g. 50000"
  className={
    errors.agreedFee ? ERROR_INPUT_CLASS : INPUT_CLASS}
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

          {/* Discount */}
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
  type="text"
  inputMode="decimal"
  value={form.discount}
  onChange={handleChange}
  onWheel={(event) => event.currentTarget.blur()}
  disabled={submitting}
  placeholder="e.g. 2000"
  className={
    errors.discount ? ERROR_INPUT_CLASS : INPUT_CLASS
  }
/>

            {renderFieldError("discount")}
          </div>
        </div>
      </div>

      <div className="my-6 border-t border-slate-200" />

      {/* Registration Payment */}
      <div>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Registration Payment
          </p>

          <p className="mt-1 text-xs text-slate-400">
            The registration fee is paid once when the student is admitted.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Registration Fee */}
          <div>
            <label
              htmlFor="registrationFee"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Registration Fee
            </label>

            <input
  id="registrationFee"
  type="text"
  inputMode="decimal"
  name="registrationFee"
  value={form.registrationFee}
  onChange={handleChange}
  onWheel={(event) => event.currentTarget.blur()}
  disabled={submitting}
  placeholder="e.g. 1000"
  className={
    errors.registrationFee
      ? ERROR_INPUT_CLASS
      : INPUT_CLASS
  }
/>

            {renderFieldError("registrationFee")}
          </div>

          {/* Registration Payment */}
          <div>
            <label
              htmlFor="registrationPayment"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Registration Payment
            </label>

           <input
  id="registrationPayment"
  type="text"
  inputMode="decimal"
  name="registrationPayment"
  value={form.registrationPayment}
  onChange={handleChange}
  onWheel={(event) => event.currentTarget.blur()}
  disabled={submitting}
  placeholder="e.g. 1000"
  className={
    errors.registrationPayment
      ? ERROR_INPUT_CLASS
      : INPUT_CLASS
  }
/>

            {renderFieldError("registrationPayment")}
          </div>

         
        </div>
      </div>

      <div className="my-6 border-t border-slate-200" />

      {/* Course Payment */}
      <div>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Course Payment
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Add a new course payment. Previous payments remain in the
            payment history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Course Payment */}
          <div>
            <label
              htmlFor="coursePayment"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Add Course Payment
            </label>

           <input
  id="coursePayment"
  type="text"
  inputMode="decimal"
  name="coursePayment"
  value={form.coursePayment}
  onChange={handleChange}
  onWheel={(event) => event.currentTarget.blur()}
  disabled={submitting}
  placeholder="e.g. 10000"
  className={
    errors.coursePayment
      ? ERROR_INPUT_CLASS
      : INPUT_CLASS
  }
/>

            {renderFieldError("coursePayment")}
          </div>

          
        </div>

        {isEditing && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleRecordCoursePayment}
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        )}
      </div>

      <div className="my-6 border-t border-slate-200" />

      {/* Payment Summary */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Payment Summary
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Registration Paid */}
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Registration Paid
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              Rs.{" "}
              {Number(
                isEditing && paymentSummary
                  ? paymentSummary.summary.registrationPaidMinor / 100
                  : form.registrationPayment || 0,
              ).toLocaleString()}
            </p>
          </div>

          {/* Registration Remaining */}
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Registration Remaining
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              Rs.{" "}
              {Number(
                isEditing && paymentSummary
                  ? paymentSummary.summary.registrationRemainingMinor / 100
                  : Math.max(
                      0,
                      Number(form.registrationFee || 0) -
                        Number(form.registrationPayment || 0),
                    ),
              ).toLocaleString()}
            </p>
          </div>

          {/* Course Paid */}
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Course Paid</p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              Rs.{" "}
              {Number(
                isEditing && paymentSummary
                  ? paymentSummary.summary.coursePaidMinor / 100
                  : form.coursePayment || 0,
              ).toLocaleString()}
            </p>
          </div>

          {/* Course Remaining */}
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Course Remaining
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              Rs.{" "}
              {Number(
                isEditing && paymentSummary
                  ? paymentSummary.summary.courseRemainingMinor / 100
                  : Math.max(
                      0,
                      Number(form.agreedFee || 0) -
                        Number(form.discount || 0) -
                        Number(form.coursePayment || 0),
                    ),
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {isEditing && paymentHistory.length > 0 && (
        <>
          <div className="my-6 border-t border-slate-200" />

          <div>
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment History
              </p>

              <p className="mt-1 text-xs text-slate-400">
                All recorded payments for this enrollment.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-200">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 transition hover:bg-slate-50"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Fee Type
                        </p>

                        <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                          {payment.feeType}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Rs.{" "}
                          {(
                            Number(payment.amountMinor) / 100
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Payment Method
                        </p>

                        <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                          {payment.paymentMethod?.replace("_", " ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Receipt
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-900">
                          {payment.receiptNumber}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      Paid at:{" "}
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>

    {/* =========================================================
        5. ADDITIONAL INFORMATION
    ========================================================= */}
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          Additional Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Notes and other useful information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Admission Notes */}
        <div>
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
              errors.enrollmentNotes
                ? ERROR_INPUT_CLASS
                : INPUT_CLASS
            }`}
          />

          {renderFieldError("enrollmentNotes")}
        </div>

        {/* Student Notes */}
        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Student Notes
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
      </div>
    </section>

    {/* =========================================================
        6. ACTIONS
    ========================================================= */}
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
