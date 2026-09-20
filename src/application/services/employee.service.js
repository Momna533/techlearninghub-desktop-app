const {
  findEmployees,
  findEmployeeById,
  findEmployeeByCode,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} = require('../../infrastructure/database/employee.repository');

const EMPLOYMENT_STATUSES = [
  'active',
  'on_leave',
  'inactive',
  'terminated',
];

function normalizeEmployeeInput(employee = {}) {
  return {
    userId:
      employee.userId === '' ||
      employee.userId === null ||
      employee.userId === undefined
        ? null
        : Number(employee.userId),

    employeeCode: String(employee.employeeCode ?? '').trim(),
    firstName: String(employee.firstName ?? '').trim(),
    lastName: String(employee.lastName ?? '').trim(),
    email: String(employee.email ?? '').trim(),
    phone: String(employee.phone ?? '').trim(),
    jobTitle: String(employee.jobTitle ?? '').trim(),
    department: String(employee.department ?? '').trim(),

    employmentStatus: String(
      employee.employmentStatus ?? 'active',
    ).trim(),

    hireDate: String(employee.hireDate ?? '').trim(),
    terminationDate:
      String(employee.terminationDate ?? '').trim() || null,

    baseSalaryMinor:
      employee.baseSalaryMinor === '' ||
      employee.baseSalaryMinor === null ||
      employee.baseSalaryMinor === undefined
        ? null
        : Number(employee.baseSalaryMinor),

    currencyCode: String(employee.currencyCode ?? '').trim() || null,
  };
}

function validateEmployee(employee) {
  if (!employee.employeeCode) {
    throw new Error('Employee code is required.');
  }

  if (!employee.firstName) {
    throw new Error('First name is required.');
  }

  if (!employee.lastName) {
    throw new Error('Last name is required.');
  }

  if (!EMPLOYMENT_STATUSES.includes(employee.employmentStatus)) {
    throw new Error('Invalid employment status.');
  }

  if (!employee.hireDate) {
    throw new Error('Hire date is required.');
  }

  if (
    employee.userId !== null &&
    (!Number.isInteger(employee.userId) || employee.userId <= 0)
  ) {
    throw new Error('Invalid user ID.');
  }

  if (
    employee.baseSalaryMinor !== null &&
    (!Number.isInteger(employee.baseSalaryMinor) ||
      employee.baseSalaryMinor < 0)
  ) {
    throw new Error('Invalid base salary.');
  }

  if (
    employee.terminationDate &&
    employee.terminationDate < employee.hireDate
  ) {
    throw new Error(
      'Termination date cannot be before hire date.',
    );
  }
}

function listEmployees({ search = '', status = 'all' } = {}) {
  if (!['all', ...EMPLOYMENT_STATUSES].includes(status)) {
    throw new Error('Invalid employment status filter.');
  }

  return findEmployees({
    search: String(search ?? ''),
    status,
  });
}

function getEmployeeById(id) {
  const employeeId = Number(id);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new Error('Invalid employee ID.');
  }

  const employee = findEmployeeById(employeeId);

  if (!employee) {
    throw new Error('Employee not found.');
  }

  return employee;
}

function createNewEmployee(input) {
  const employee = normalizeEmployeeInput(input);

  validateEmployee(employee);

  const existingEmployee = findEmployeeByCode(
    employee.employeeCode,
  );

  if (existingEmployee) {
    throw new Error(
      'An employee with this employee code already exists.',
    );
  }

  return createEmployee(employee);
}

function updateExistingEmployee(id, input) {
  const employeeId = Number(id);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new Error('Invalid employee ID.');
  }

  const existingEmployee = findEmployeeById(employeeId);

  if (!existingEmployee) {
    throw new Error('Employee not found.');
  }

  const employee = normalizeEmployeeInput(input);

  validateEmployee(employee);

  const employeeWithSameCode = findEmployeeByCode(
    employee.employeeCode,
  );

  if (
    employeeWithSameCode &&
    Number(employeeWithSameCode.id) !== employeeId
  ) {
    throw new Error(
      'An employee with this employee code already exists.',
    );
  }

  return updateEmployee(employeeId, employee);
}

function deactivateExistingEmployee(id) {
  const employeeId = Number(id);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new Error('Invalid employee ID.');
  }

  const existingEmployee = findEmployeeById(employeeId);

  if (!existingEmployee) {
    throw new Error('Employee not found.');
  }

  if (existingEmployee.employment_status === 'inactive') {
    return existingEmployee;
  }

  return deactivateEmployee(employeeId);
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createNewEmployee,
  updateExistingEmployee,
  deactivateExistingEmployee,
};