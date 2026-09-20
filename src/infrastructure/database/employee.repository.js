const { getDatabase } = require('./connection');

function findEmployees({ search = '', status = 'all' } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        e.employee_code LIKE $search
        OR e.first_name LIKE $search
        OR e.last_name LIKE $search
        OR TRIM(e.first_name || ' ' || e.last_name) LIKE $search
        OR e.email LIKE $search
        OR e.phone LIKE $search
        OR e.job_title LIKE $search
        OR e.department LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (status !== 'all') {
    conditions.push('e.employment_status = $status');
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return database
    .prepare(`
      SELECT
        e.id,
        e.user_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        TRIM(e.first_name || ' ' || e.last_name) AS full_name,
        e.email,
        e.phone,
        e.job_title,
        e.department,
        e.employment_status,
        e.hire_date,
        e.termination_date,
        e.base_salary_minor,
        e.currency_code,
        e.created_at,
        e.updated_at
      FROM employees e
      ${whereClause}
      ORDER BY e.first_name ASC, e.last_name ASC
    `)
    .all(parameters);
}

function findEmployeeById(id) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        e.id,
        e.user_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        TRIM(e.first_name || ' ' || e.last_name) AS full_name,
        e.email,
        e.phone,
        e.job_title,
        e.department,
        e.employment_status,
        e.hire_date,
        e.termination_date,
        e.base_salary_minor,
        e.currency_code,
        e.created_at,
        e.updated_at
      FROM employees e
      WHERE e.id = ?
      LIMIT 1
    `)
    .get(id);
}

function findEmployeeByCode(employeeCode) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        id,
        user_id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        job_title,
        department,
        employment_status,
        hire_date,
        termination_date,
        base_salary_minor,
        currency_code,
        created_at,
        updated_at
      FROM employees
      WHERE employee_code = ?
      LIMIT 1
    `)
    .get(employeeCode.trim());
}

function createEmployee(employee) {
  const database = getDatabase();

  const result = database
    .prepare(`
      INSERT INTO employees (
        user_id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        job_title,
        department,
        employment_status,
        hire_date,
        termination_date,
        base_salary_minor,
        currency_code
      )
      VALUES (
        @userId,
        @employeeCode,
        @firstName,
        @lastName,
        @email,
        @phone,
        @jobTitle,
        @department,
        @employmentStatus,
        @hireDate,
        @terminationDate,
        @baseSalaryMinor,
        @currencyCode
      )
    `)
    .run({
      userId: employee.userId,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      jobTitle: employee.jobTitle,
      department: employee.department,
      employmentStatus: employee.employmentStatus,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate,
      baseSalaryMinor: employee.baseSalaryMinor,
      currencyCode: employee.currencyCode,
    });

  return findEmployeeById(Number(result.lastInsertRowid));
}

function updateEmployee(id, employee) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE employees
      SET
        user_id = @userId,
        employee_code = @employeeCode,
        first_name = @firstName,
        last_name = @lastName,
        email = @email,
        phone = @phone,
        job_title = @jobTitle,
        department = @department,
        employment_status = @employmentStatus,
        hire_date = @hireDate,
        termination_date = @terminationDate,
        base_salary_minor = @baseSalaryMinor,
        currency_code = @currencyCode,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
    .run({
      id,
      userId: employee.userId,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      jobTitle: employee.jobTitle,
      department: employee.department,
      employmentStatus: employee.employmentStatus,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate,
      baseSalaryMinor: employee.baseSalaryMinor,
      currencyCode: employee.currencyCode,
    });

  return findEmployeeById(id);
}

function deactivateEmployee(id) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE employees
      SET
        employment_status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  return findEmployeeById(id);
}

module.exports = {
  findEmployees,
  findEmployeeById,
  findEmployeeByCode,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
};