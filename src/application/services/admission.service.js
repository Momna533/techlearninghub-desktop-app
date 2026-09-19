import {
  findStudentByCode,
  findStudentById,
} from "../../infrastructure/database/student.repository.js";

import {
  findBatchById,
  findActiveCourses,
} from "../../infrastructure/database/batch.repository.js";

import { countActiveEnrollments } from "../../infrastructure/database/enrollments.repository.js";

import { transaction } from "../../infrastructure/database/connection.js";

function generateStudentCode() {
  return `STU-${Date.now().toString(36).toUpperCase()}`;
}

function validateAdmission(admission) {
  const errors = {};

  if (!admission.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!admission.lastName?.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!admission.guardianName?.trim()) {
    errors.guardianName = "Guardian/father name is required.";
  }

  if (!admission.phone?.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (admission.email?.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(admission.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (!admission.batchId) {
    errors.batchId = "Batch is required.";
  }

  if (!admission.enrolledAt) {
    errors.enrolledAt = "Admission date is required.";
  }

  if (
    admission.agreedFeeMinor === null ||
    admission.agreedFeeMinor === undefined ||
    admission.agreedFeeMinor === ""
  ) {
    errors.agreedFeeMinor = "Agreed fee is required.";
  } else if (
    !Number.isInteger(Number(admission.agreedFeeMinor)) ||
    Number(admission.agreedFeeMinor) < 0
  ) {
    errors.agreedFeeMinor = "Agreed fee must be zero or greater.";
  }

  if (
    admission.discountMinor !== null &&
    admission.discountMinor !== undefined &&
    admission.discountMinor !== "" &&
    (!Number.isInteger(Number(admission.discountMinor)) ||
      Number(admission.discountMinor) < 0)
  ) {
    errors.discountMinor = "Discount must be zero or greater.";
  }

  if (
    admission.discountMinor !== null &&
    admission.discountMinor !== undefined &&
    admission.discountMinor !== "" &&
    admission.agreedFeeMinor !== null &&
    admission.agreedFeeMinor !== undefined &&
    admission.agreedFeeMinor !== ""
  ) {
    if (Number(admission.discountMinor) > Number(admission.agreedFeeMinor)) {
      errors.discountMinor = "Discount cannot be greater than the agreed fee.";
    }
  }

  return errors;
}

function normalizeAdmission(admission) {
  const studentCode = admission.studentCode?.trim() || generateStudentCode();

  const discountMinor =
    admission.discountMinor === "" ||
    admission.discountMinor === null ||
    admission.discountMinor === undefined
      ? 0
      : Number(admission.discountMinor);

  return {
    student: {
      studentCode,
      firstName: admission.firstName.trim(),
      lastName: admission.lastName.trim(),
      guardianName: admission.guardianName.trim(),
      guardianPhone: admission.guardianPhone?.trim() || null,
      phone: admission.phone.trim(),
      email: admission.email?.trim() || null,
      address: admission.address?.trim() || null,
      dateOfBirth: admission.dateOfBirth || null,
      status: admission.status || "active",
      notes: admission.notes?.trim() || null,
    },

    enrollment: {
      batchId: Number(admission.batchId),
      enrolledAt: admission.enrolledAt,
      status: admission.enrollmentStatus || "active",
      agreedFeeMinor: Number(admission.agreedFeeMinor),
      discountMinor,
      currencyCode: admission.currencyCode?.trim().toUpperCase() || "PKR",
      notes: admission.enrollmentNotes?.trim() || null,
    },
  };
}

function validateBatch(batchId) {
  const batch = findBatchById(batchId);

  if (!batch) {
    const error = new Error("Selected batch does not exist.");

    error.code = "INVALID_BATCH";

    throw error;
  }

  if (batch.status === "cancelled") {
    const error = new Error("Cannot admit a student into a cancelled batch.");

    error.code = "BATCH_CANCELLED";

    throw error;
  }

  if (batch.status === "completed") {
    const error = new Error("Cannot admit a student into a completed batch.");

    error.code = "BATCH_COMPLETED";

    throw error;
  }

  if (batch.capacity !== null && batch.capacity !== undefined) {
    const enrolledCount = countActiveEnrollments(batch.id);

    if (enrolledCount >= batch.capacity) {
      const error = new Error("This batch has reached its capacity.");

      error.code = "BATCH_CAPACITY_REACHED";

      throw error;
    }
  }

  return batch;
}

function insertStudent(database, student) {
  const result = database
    .prepare(
      `
            INSERT INTO students (
                student_code,
                first_name,
                last_name,
                email,
                phone,
                guardian_name,
                guardian_phone,
                address,
                date_of_birth,
                status,
                notes
            )
            VALUES (
                @studentCode,
                @firstName,
                @lastName,
                @email,
                @phone,
                @guardianName,
                @guardianPhone,
                @address,
                @dateOfBirth,
                @status,
                @notes
            )
        `,
    )
    .run({
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      notes: student.notes,
    });

  return Number(result.lastInsertRowid);
}

function insertEnrollment(database, studentId, enrollment) {
  const result = database
    .prepare(
      `
            INSERT INTO enrollments (
                student_id,
                batch_id,
                enrolled_at,
                status,
                agreed_fee_minor,
                discount_minor,
                currency_code,
                notes
            )
            VALUES (
                @studentId,
                @batchId,
                @enrolledAt,
                @status,
                @agreedFeeMinor,
                @discountMinor,
                @currencyCode,
                @notes
            )
        `,
    )
    .run({
      studentId,
      batchId: enrollment.batchId,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      agreedFeeMinor: enrollment.agreedFeeMinor,
      discountMinor: enrollment.discountMinor,
      currencyCode: enrollment.currencyCode,
      notes: enrollment.notes,
    });

  return Number(result.lastInsertRowid);
}

export function createAdmission(admission) {
  const errors = validateAdmission(admission);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");

    error.code = "VALIDATION_ERROR";

    error.details = errors;

    throw error;
  }

  const normalized = normalizeAdmission(admission);

  const existingStudent = findStudentByCode(normalized.student.studentCode);

  if (existingStudent) {
    const error = new Error("Student ID already exists.");

    error.code = "DUPLICATE_STUDENT_ID";

    throw error;
  }

  const batch = validateBatch(normalized.enrollment.batchId);

  if (normalized.student.status === "inactive") {
    const error = new Error("Cannot admit an inactive student.");

    error.code = "STUDENT_INACTIVE";

    throw error;
  }

  return transaction((database) => {
    const studentId = insertStudent(database, normalized.student);

    const enrollmentId = insertEnrollment(
      database,
      studentId,
      normalized.enrollment,
    );

    const student = database
      .prepare(
        `
                    SELECT
                        id,
                        student_code,
                        first_name,
                        last_name,
                        email,
                        phone,
                        guardian_name,
                        guardian_phone,
                        address,
                        date_of_birth,
                        status,
                        joined_at,
                        notes,
                        created_at,
                        updated_at
                    FROM students
                    WHERE id = ?
                    LIMIT 1
                `,
      )
      .get(studentId);

    const enrollment = database
      .prepare(
        `
                    SELECT
                        en.id,
                        en.student_id,
                        en.batch_id,
                        en.enrolled_at,
                        en.status,
                        en.agreed_fee_minor,
                        en.discount_minor,
                        en.currency_code,
                        en.notes,
                        en.created_at,
                        en.updated_at
                    FROM enrollments en
                    WHERE en.id = ?
                    LIMIT 1
                `,
      )
      .get(enrollmentId);

    return {
      student,
      enrollment,
      batchId: batch.id,
    };
  });
}
