import {
  findCourses,
  findCourseById,
  findCourseByCode,
  createCourse as insertCourse,
  updateCourse as updateCourseRecord,
  deactivateCourse as deactivateCourseRecord,
} from "../../infrastructure/database/courses.repository.js";

function generateCourseCode(name) {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  return `CRS-${normalized || "COURSE"}-${Date.now().toString(36).toUpperCase()}`;
}

function normalizeModules(modules) {
  if (!Array.isArray(modules)) {
    return [];
  }

  return modules
    .map((module) => {
      if (typeof module === "string") {
        return module.trim();
      }

      if (module && typeof module === "object") {
        return {
          title: String(module.title || "").trim(),
          description: String(module.description || "").trim(),
        };
      }

      return "";
    })
    .filter((module) => {
      if (typeof module === "string") {
        return module.length > 0;
      }

      return module.title.length > 0;
    });
}

function validateCourse(course) {
  const errors = {};

  if (!course.name?.trim()) {
    errors.name = "Course name is required.";
  }

  if (course.name?.trim().length > 150) {
    errors.name = "Course name must not exceed 150 characters.";
  }

  if (course.description?.trim().length > 5000) {
    errors.description = "Description must not exceed 5000 characters.";
  }

  if (
    course.durationWeeks !== null &&
    course.durationWeeks !== "" &&
    (!Number.isInteger(Number(course.durationWeeks)) ||
      Number(course.durationWeeks) <= 0)
  ) {
    errors.durationWeeks = "Duration must be a positive whole number.";
  }

  if (
    course.totalSessions !== null &&
    course.totalSessions !== "" &&
    (!Number.isInteger(Number(course.totalSessions)) ||
      Number(course.totalSessions) <= 0)
  ) {
    errors.totalSessions = "Total sessions must be a positive whole number.";
  }

  if (
    course.sessionsPerWeek !== null &&
    course.sessionsPerWeek !== "" &&
    (!Number.isInteger(Number(course.sessionsPerWeek)) ||
      Number(course.sessionsPerWeek) <= 0)
  ) {
    errors.sessionsPerWeek =
      "Sessions per week must be a positive whole number.";
  }

  if (
    course.fee !== null &&
    course.fee !== "" &&
    (Number.isNaN(Number(course.fee)) || Number(course.fee) < 0)
  ) {
    errors.fee = "Fee must be zero or greater.";
  }

  if (
    course.fee !== null &&
    course.fee !== "" &&
    Number(course.fee) > 999999999
  ) {
    errors.fee = "Fee is too large.";
  }

  if (
    course.currencyCode &&
    !/^[A-Z]{3}$/.test(course.currencyCode.trim().toUpperCase())
  ) {
    errors.currencyCode = "Currency must be a valid 3-letter currency code.";
  }

  const allowedStatuses = ["active", "inactive", "archived"];

  if (!allowedStatuses.includes(course.status)) {
    errors.status = "Invalid course status.";
  }

  const modules = normalizeModules(course.modules);

  if (modules.length > 100) {
    errors.modules = "A course cannot contain more than 100 modules.";
  }

  return errors;
}

function normalizeCourse(course) {
  const fee =
    course.fee === "" || course.fee === null || course.fee === undefined
      ? null
      : Number(course.fee);

  return {
    courseCode: course.courseCode?.trim(),
    name: course.name.trim(),
    description: course.description?.trim() || null,

    durationWeeks:
      course.durationWeeks === "" ||
      course.durationWeeks === null ||
      course.durationWeeks === undefined
        ? null
        : Number(course.durationWeeks),

    feeMinor: fee === null ? null : Math.round(fee * 100),

    currencyCode: course.currencyCode?.trim().toUpperCase() || "PKR",

    totalSessions:
      course.totalSessions === "" ||
      course.totalSessions === null ||
      course.totalSessions === undefined
        ? null
        : Number(course.totalSessions),

    sessionsPerWeek:
      course.sessionsPerWeek === "" ||
      course.sessionsPerWeek === null ||
      course.sessionsPerWeek === undefined
        ? null
        : Number(course.sessionsPerWeek),

    modules: normalizeModules(course.modules),

    status: course.status || "active",
  };
}

export function getCourses(filters = {}) {
  return findCourses(filters);
}

export function getCourse(id) {
  const course = findCourseById(id);

  if (!course) {
    throw new Error("Course not found.");
  }

  return course;
}

export function createCourse(course) {
  const errors = validateCourse(course);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");
    error.code = "VALIDATION_ERROR";
    error.details = errors;

    throw error;
  }

  const normalized = normalizeCourse(course);

  normalized.courseCode = generateCourseCode(normalized.name);

  const existingCourse = findCourseByCode(normalized.courseCode);

  if (existingCourse) {
    const error = new Error("Course code already exists.");
    error.code = "DUPLICATE_COURSE_CODE";

    throw error;
  }

  return insertCourse(normalized);
}

export function updateCourse(id, course) {
  const existingCourse = findCourseById(id);

  if (!existingCourse) {
    throw new Error("Course not found.");
  }

  const errors = validateCourse(course);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed.");
    error.code = "VALIDATION_ERROR";
    error.details = errors;

    throw error;
  }

  const normalized = normalizeCourse(course);

  normalized.courseCode =
    course.courseCode?.trim() || existingCourse.courseCode;

  const duplicate = findCourseByCode(normalized.courseCode);

  if (duplicate && duplicate.id !== id) {
    const error = new Error("Course code already exists.");
    error.code = "DUPLICATE_COURSE_CODE";

    throw error;
  }

  return updateCourseRecord(id, normalized);
}

export function deactivateCourse(id) {
  const course = findCourseById(id);

  if (!course) {
    throw new Error("Course not found.");
  }

  if (course.status === "inactive") {
    throw new Error("Course is already inactive.");
  }

  return deactivateCourseRecord(id);
}
