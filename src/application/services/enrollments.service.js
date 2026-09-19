import {
  findEnrollments,
  findEnrollmentById,
  findEnrollmentByStudentAndBatch,
  findStudentEnrollments,
  findBatchEnrollments,
  countActiveEnrollments,
  createEnrollment as insertEnrollment,
  updateEnrollment as updateEnrollmentRecord,
  updateEnrollmentStatus as updateEnrollmentStatusRecord,
} from "../../infrastructure/database/enrollments.repository.js";

import { findStudentById } from "../../infrastructure/database/student.repository.js";

import { findBatchById } from "../../infrastructure/database/batch.repository.js";

const ALLOWED_STATUSES = [
  "pending",
  "active",
  "completed",
  "withdrawn",
  "cancelled",
];

function validateEnrollment(enrollment) {
  const errors = {};

  if (!enrollment.studentId) {
    errors.studentId = "Student is required.";
  }

  // if (!enrollment.batchId) {
  //   errors.batchId = "Batch is required.";
  // }

  if (!enrollment.enrolledAt) {
    errors.enrolledAt = "Admission date is required.";
  }

  if (!ALLOWED_STATUSES.includes(enrollment.status)) {
    errors.status = "Invalid enrollment status.";
  }

  if (
    enrollment.agreedFeeMinor === null ||
    enrollment.agreedFeeMinor === undefined ||
    enrollment.agreedFeeMinor === ""
  ) {
    errors.agreedFeeMinor = "Agreed fee is required.";
  } else if (
    !Number.isInteger(Number(enrollment.agreedFeeMinor)) ||
    Number(enrollment.agreedFeeMinor) < 0
  ) {
    errors.agreedFeeMinor = "Agreed fee must be zero or greater.";
  }

  if (
    enrollment.discountMinor !== null &&
    enrollment.discountMinor !== undefined &&
    enrollment.discountMinor !== "" &&
    (!Number.isInteger(Number(enrollment.discountMinor)) ||
      Number(enrollment.discountMinor) < 0)
  ) {
    errors.discountMinor = "Discount must be zero or greater.";
  }

  if (
    enrollment.currencyCode &&
    !/^[A-Z]{3}$/.test(enrollment.currencyCode.trim().toUpperCase())
  ) {
    errors.currencyCode = "Currency must be a valid 3-letter currency code.";
  }

  if (
    enrollment.discountMinor !== null &&
    enrollment.discountMinor !== undefined &&
    enrollment.discountMinor !== "" &&
    enrollment.agreedFeeMinor !== null &&
    enrollment.agreedFeeMinor !== undefined &&
    enrollment.agreedFeeMinor !== ""
  ) {
    if (Number(enrollment.discountMinor) > Number(enrollment.agreedFeeMinor)) {
      errors.discountMinor = "Discount cannot be greater than the agreed fee.";
    }
  }

  if (enrollment.enrolledAt && enrollment.withdrawnAt) {
    if (enrollment.withdrawnAt < enrollment.enrolledAt) {
      errors.withdrawnAt =
        "Withdrawal date cannot be before the admission date.";
    }
  }

  return errors;
}

function normalizeEnrollment(enrollment) {
  return {
    studentId: Number(enrollment.studentId),

    batchId: Number(enrollment.batchId),

    enrolledAt: enrollment.enrolledAt,

    withdrawnAt: enrollment.withdrawnAt || null,

    status: enrollment.status || "active",

    agreedFeeMinor: Number(enrollment.agreedFeeMinor),

    discountMinor:
      enrollment.discountMinor === "" ||
      enrollment.discountMinor === null ||
      enrollment.discountMinor === undefined
        ? 0
        : Number(enrollment.discountMinor),

    currencyCode: enrollment.currencyCode?.trim().toUpperCase() || "PKR",

    notes: enrollment.notes?.trim() || null,
  };
}

function validateStudentReference(studentId) {
  const student = findStudentById(studentId);

  if (!student) {
    const error = new Error("Selected student does not exist.");

    error.code = "INVALID_STUDENT";

    throw error;
  }

  return student;
}

function validateBatchReference(batchId) {
  const batch = findBatchById(batchId);

  if (!batch) {
    const error = new Error("Selected batch does not exist.");

    error.code = "INVALID_BATCH";

    throw error;
  }

  if (batch.status === "cancelled") {
    const error = new Error("Cannot enroll a student into a cancelled batch.");

    error.code = "BATCH_CANCELLED";

    throw error;
  }

  if (batch.status === "completed") {
    const error = new Error("Cannot enroll a student into a completed batch.");

    error.code = "BATCH_COMPLETED";

    throw error;
  }

  return batch;
}

function validateDuplicateEnrollment(studentId, batchId, currentId = null) {
  const existing = findEnrollmentByStudentAndBatch(studentId, batchId);

  if (existing && existing.id !== currentId) {
    const error = new Error("This student is already enrolled in this batch.");

    error.code = "DUPLICATE_ENROLLMENT";

    throw error;
  }
}

function validateCapacity(batch, studentId, currentEnrollmentId = null) {
  if (batch.capacity === null || batch.capacity === undefined) {
    return;
  }

  const existingEnrollment = currentEnrollmentId
    ? findEnrollmentById(currentEnrollmentId)
    : null;

  if (existingEnrollment && existingEnrollment.studentId === studentId) {
    return;
  }

  const enrolledCount = countActiveEnrollments(batch.id);

  if (enrolledCount >= batch.capacity) {
    const error = new Error("This batch has reached its capacity.");

    error.code = "BATCH_CAPACITY_REACHED";

    throw error;
  }
}

export function getEnrollments(filters = {}) {
  return findEnrollments(filters);
}

export function getEnrollment(id) {
  const enrollment = findEnrollmentById(id);

  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  return enrollment;
}

export function getStudentEnrollments(studentId) {
  validateStudentReference(studentId);

  return findStudentEnrollments(studentId);
}

export function getBatchEnrollments(batchId) {
  validateBatchReference(batchId);

  return findBatchEnrollments(batchId);
}

export function createEnrollment(enrollment) {
  const errors = validateEnrollment(enrollment);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");

    error.code = "VALIDATION_ERROR";

    error.details = errors;

    throw error;
  }

  const normalized = normalizeEnrollment(enrollment);

  const student = validateStudentReference(normalized.studentId);

  if (student.status === "inactive") {
    const error = new Error("Cannot enroll an inactive student.");

    error.code = "STUDENT_INACTIVE";

    throw error;
  }

  const batch = validateBatchReference(normalized.batchId);

  if (batch.courseId === null || batch.courseId === undefined) {
    const error = new Error("Selected batch is not linked to a course.");

    error.code = "BATCH_COURSE_MISSING";

    throw error;
  }

  validateDuplicateEnrollment(normalized.studentId, normalized.batchId);

  if (normalized.status === "pending" || normalized.status === "active") {
    validateCapacity(batch, normalized.studentId);
  }

  return insertEnrollment(normalized);
}

export function updateEnrollment(id, enrollment) {
  const existing = findEnrollmentById(id);

  if (!existing) {
    throw new Error("Enrollment not found.");
  }

  const errors = validateEnrollment(enrollment);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");

    error.code = "VALIDATION_ERROR";

    error.details = errors;

    throw error;
  }

  const normalized = normalizeEnrollment(enrollment);

  validateStudentReference(normalized.studentId);

  const batch = validateBatchReference(normalized.batchId);

  validateDuplicateEnrollment(normalized.studentId, normalized.batchId, id);

  if (normalized.status === "pending" || normalized.status === "active") {
    validateCapacity(batch, normalized.studentId, id);
  }

  return updateEnrollmentRecord(id, normalized);
}

export function updateEnrollmentStatus(id, status) {
  const enrollment = findEnrollmentById(id);

  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    const error = new Error("Invalid enrollment status.");

    error.code = "INVALID_STATUS";

    throw error;
  }

  let withdrawnAt = enrollment.withdrawnAt;

  if (status === "withdrawn") {
    withdrawnAt = withdrawnAt || new Date().toISOString().slice(0, 10);
  }

  if (status !== "withdrawn" && status !== "cancelled") {
    withdrawnAt = null;
  }

  if (status === "pending" || status === "active") {
    const batch = validateBatchReference(enrollment.batchId);

    validateCapacity(batch, enrollment.studentId, id);
  }

  return updateEnrollmentStatusRecord(id, status, withdrawnAt);
}
