const { getDatabase } = require("./connection");

function mapCourse(row) {
  if (!row) return null;

  let modules = [];

  try {
    modules = JSON.parse(row.modules_json || "[]");
  } catch {
    modules = [];
  }

  return {
    id: row.id,
    courseCode: row.course_code,
    name: row.name,
    description: row.description,
    durationWeeks: row.duration_weeks,
    feeMinor: row.default_fee_minor,
    currencyCode: row.currency_code,
    totalSessions: row.total_sessions,
    sessionsPerWeek: row.sessions_per_week,
    modules,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COURSE_SELECT = `
  SELECT
    id,
    course_code,
    name,
    description,
    duration_weeks,
    default_fee_minor,
    currency_code,
    total_sessions,
    sessions_per_week,
    modules_json,
    status,
    created_at,
    updated_at
  FROM courses
`;

function findCourses({ search = "", status = "all" } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        course_code LIKE $search
        OR name LIKE $search
        OR description LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (status !== "all") {
    conditions.push("status = $status");
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const rows = database
    .prepare(
      `
      ${COURSE_SELECT}
      ${whereClause}
      ORDER BY name ASC
    `,
    )
    .all(parameters);

  return rows.map(mapCourse);
}

function findCourseById(id) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      ${COURSE_SELECT}
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(id);

  return mapCourse(row);
}

function findCourseByCode(courseCode) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      ${COURSE_SELECT}
      WHERE course_code = ?
      LIMIT 1
    `,
    )
    .get(courseCode.trim());

  return mapCourse(row);
}

function createCourse(course) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO courses (
        course_code,
        name,
        description,
        duration_weeks,
        default_fee_minor,
        currency_code,
        total_sessions,
        sessions_per_week,
        modules_json,
        status
      )
      VALUES (
        @courseCode,
        @name,
        @description,
        @durationWeeks,
        @feeMinor,
        @currencyCode,
        @totalSessions,
        @sessionsPerWeek,
        @modulesJson,
        @status
      )
    `,
    )
    .run({
      courseCode: course.courseCode,
      name: course.name,
      description: course.description,
      durationWeeks: course.durationWeeks,
      feeMinor: course.feeMinor,
      currencyCode: course.currencyCode,
      totalSessions: course.totalSessions,
      sessionsPerWeek: course.sessionsPerWeek,
      modulesJson: JSON.stringify(course.modules),
      status: course.status,
    });

  return findCourseById(Number(result.lastInsertRowid));
}

function updateCourse(id, course) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE courses
      SET
        course_code = @courseCode,
        name = @name,
        description = @description,
        duration_weeks = @durationWeeks,
        default_fee_minor = @feeMinor,
        currency_code = @currencyCode,
        total_sessions = @totalSessions,
        sessions_per_week = @sessionsPerWeek,
        modules_json = @modulesJson,
        status = @status,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      courseCode: course.courseCode,
      name: course.name,
      description: course.description,
      durationWeeks: course.durationWeeks,
      feeMinor: course.feeMinor,
      currencyCode: course.currencyCode,
      totalSessions: course.totalSessions,
      sessionsPerWeek: course.sessionsPerWeek,
      modulesJson: JSON.stringify(course.modules),
      status: course.status,
    });

  return findCourseById(id);
}

function deactivateCourse(id) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE courses
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(id);

  return findCourseById(id);
}

module.exports = {
  findCourses,
  findCourseById,
  findCourseByCode,
  createCourse,
  updateCourse,
  deactivateCourse,
};
