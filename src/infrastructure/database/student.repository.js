const { getDatabase } = require("./connection");

function findStudents({ search = "", status = "all" } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        student_code LIKE $search
        OR first_name LIKE $search
        OR last_name LIKE $search
        OR phone LIKE $search
        OR email LIKE $search
        OR guardian_name LIKE $search
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

  return database
    .prepare(
      `
      SELECT
        id,
        student_code,
        first_name,
        last_name,
         gender,
  identity_number,
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
      ${whereClause}
      ORDER BY last_name ASC, first_name ASC
    `,
    )
    .all(parameters);
}

function findStudentById(id) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        id,
        student_code,
        first_name,
        last_name,
         gender,
  identity_number,
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
    .get(id);
}

function findStudentByCode(studentCode) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        id,
        student_code,
        first_name,
        last_name,
         gender,
  identity_number,
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
      WHERE student_code = ?
      LIMIT 1
    `,
    )
    .get(studentCode.trim());
}

function createStudent(student) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO students (
        student_code,
        first_name,
        last_name,
        gender,
  identity_number,
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
         @gender,
  @identityNumber,
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
      gender: student.gender,
      identityNumber: student.identityNumber,
      email: student.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      notes: student.notes,
    });

  return findStudentById(Number(result.lastInsertRowid));
}

function updateStudent(id, student) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE students
      SET
        student_code = @studentCode,
        first_name = @firstName,
        last_name = @lastName,
        gender = @gender,
identity_number = @identityNumber,
        email = @email,
        phone = @phone,
        guardian_name = @guardianName,
        guardian_phone = @guardianPhone,
        address = @address,
        date_of_birth = @dateOfBirth,
        status = @status,
        notes = @notes,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      identityNumber: student.identityNumber,
      email: student.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      notes: student.notes,
    });

  return findStudentById(id);
}

function deactivateStudent(id) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE students
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(id);

  return findStudentById(id);
}

module.exports = {
  findStudents,
  findStudentById,
  findStudentByCode,
  createStudent,
  updateStudent,
  deactivateStudent,
};
