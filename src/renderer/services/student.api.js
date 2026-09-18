export async function listStudents(filters = {}) {
  return window.desktop.students.list(filters);
}

export async function getStudent(id) {
  return window.desktop.students.get(id);
}

export async function createStudent(student) {
  return window.desktop.students.create(student);
}

export async function updateStudent(id, student) {
  return window.desktop.students.update({
    id,
    student,
  });
}

export async function deactivateStudent(id) {
  return window.desktop.students.deactivate(id);
}