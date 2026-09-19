const {
  findBatches,
  findBatchById,
  findBatchByCode,
  createBatch: insertBatch,
  updateBatch: updateBatchRecord,
  findActiveCourses,
  findTrainerEmployees,
} = require("../../infrastructure/database/batch.repository");

function generateBatchCode(name) {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  return `BAT-${normalized || "BATCH"}-${Date.now()
    .toString(36)
    .toUpperCase()}`;
}

function validateBatch(batch) {
  const errors = {};

  if (!batch.name?.trim()) {
    errors.name = "Batch name is required.";
  }

  if (batch.name?.trim().length > 150) {
    errors.name = "Batch name must not exceed 150 characters.";
  }

  if (!batch.courseId) {
    errors.courseId = "Course is required.";
  }

  if (!batch.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (batch.endDate && batch.startDate && batch.endDate < batch.startDate) {
    errors.endDate = "End date cannot be before start date.";
  }

  if (!Array.isArray(batch.days) || batch.days.length === 0) {
    errors.days = "Select at least one day.";
  }

  if (!batch.startTime) {
    errors.startTime = "Start time is required.";
  }

  if (!batch.endTime) {
    errors.endTime = "End time is required.";
  }

  if (batch.startTime && batch.endTime && batch.endTime <= batch.startTime) {
    errors.endTime = "End time must be later than start time.";
  }

  if (!batch.room?.trim()) {
    errors.room = "Room is required.";
  }

  if (
    batch.capacity !== "" &&
    batch.capacity !== null &&
    batch.capacity !== undefined &&
    (!Number.isInteger(Number(batch.capacity)) || Number(batch.capacity) <= 0)
  ) {
    errors.capacity = "Capacity must be a positive whole number.";
  }

  if (
    batch.fee !== "" &&
    batch.fee !== null &&
    batch.fee !== undefined &&
    (Number.isNaN(Number(batch.fee)) || Number(batch.fee) < 0)
  ) {
    errors.fee = "Fee must be zero or greater.";
  }

  const allowedStatuses = ["planned", "active", "completed", "cancelled"];

  if (!allowedStatuses.includes(batch.status)) {
    errors.status = "Invalid batch status.";
  }

  return errors;
}

function normalizeBatch(batch) {
  const fee =
    batch.fee === "" || batch.fee === null || batch.fee === undefined
      ? null
      : Number(batch.fee);

  return {
    courseId: Number(batch.courseId),

    trainerEmployeeId:
      batch.trainerEmployeeId === "" ||
      batch.trainerEmployeeId === null ||
      batch.trainerEmployeeId === undefined
        ? null
        : Number(batch.trainerEmployeeId),

    batchCode: batch.batchCode?.trim(),

    name: batch.name.trim(),

    startDate: batch.startDate,

    endDate: batch.endDate || null,

    capacity:
      batch.capacity === "" ||
      batch.capacity === null ||
      batch.capacity === undefined
        ? null
        : Number(batch.capacity),

    days: Array.isArray(batch.days) ? batch.days : [],

    startTime: batch.startTime,

    endTime: batch.endTime,

    room: batch.room?.trim() || "",

    feeMinor: fee === null ? null : Math.round(fee * 100),

    currencyCode: batch.currencyCode?.trim().toUpperCase() || "PKR",

    status: batch.status || "planned",
  };
}

function validateReferences(batch) {
  const databaseCourses = findActiveCourses();

  const courseExists = databaseCourses.some(
    (course) => course.id === batch.courseId,
  );

  if (!courseExists) {
    const error = new Error("Selected course does not exist or is inactive.");
    error.code = "INVALID_COURSE";
    throw error;
  }
  // const trainers = findTrainerEmployees();

  // const trainerExists = trainers.some(
  //   (trainer) => trainer.id === batch.trainerEmployeeId,
  // );

  // if (!trainerExists) {
  //   const error = new Error("Selected trainer does not exist or is inactive.");
  //   error.code = "INVALID_TRAINER";
  //   throw error;
  // }
}

function getBatches(filters = {}) {
  return findBatches(filters);
}

function getBatch(id) {
  const batch = findBatchById(id);

  if (!batch) {
    throw new Error("Batch not found.");
  }

  return batch;
}

function createBatch(batch) {
  const errors = validateBatch(batch);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");
    error.code = "VALIDATION_ERROR";
    error.details = errors;

    throw error;
  }

  const normalized = normalizeBatch(batch);

  validateReferences(normalized);

  normalized.batchCode =
    normalized.batchCode || generateBatchCode(normalized.name);

  const existing = findBatchByCode(normalized.batchCode);

  if (existing) {
    const error = new Error("Batch code already exists.");
    error.code = "DUPLICATE_BATCH_CODE";

    throw error;
  }

  return insertBatch(normalized);
}

function updateBatch(id, batch) {
  const existingBatch = findBatchById(id);

  if (!existingBatch) {
    throw new Error("Batch not found.");
  }

  const errors = validateBatch(batch);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");
    error.code = "VALIDATION_ERROR";
    error.details = errors;

    throw error;
  }

  const normalized = normalizeBatch(batch);

  validateReferences(normalized);

  normalized.batchCode =
    normalized.batchCode?.trim() || existingBatch.batchCode;

  const duplicate = findBatchByCode(normalized.batchCode);

  if (duplicate && duplicate.id !== id) {
    const error = new Error("Batch code already exists.");
    error.code = "DUPLICATE_BATCH_CODE";

    throw error;
  }

  if (
    normalized.capacity !== null &&
    existingBatch.enrolledCount > normalized.capacity
  ) {
    const error = new Error(
      `Capacity cannot be lower than the current enrolled count (${existingBatch.enrolledCount}).`,
    );

    error.code = "CAPACITY_BELOW_ENROLLMENT";

    throw error;
  }

  return updateBatchRecord(id, normalized);
}

module.exports = {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  findActiveCourses,
  findTrainerEmployees,
};
