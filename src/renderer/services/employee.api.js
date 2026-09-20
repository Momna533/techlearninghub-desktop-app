export async function listEmployees(filters = {}) {
  return window.desktop.employees.list(filters);
}

export async function getEmployee(id) {
  return window.desktop.employees.get(id);
}

export async function createEmployee(employee) {
  return window.desktop.employees.create(employee);
}

export async function updateEmployee(id, employee) {
  return window.desktop.employees.update({ id, employee });
}

export async function deactivateEmployee(id) {
  return window.desktop.employees.deactivate(id);
}