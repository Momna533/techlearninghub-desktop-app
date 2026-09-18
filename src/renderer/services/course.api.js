export async function listCourses(filters = {}) {
  return window.desktop.courses.list(filters);
}

export async function getCourse(id) {
  return window.desktop.courses.get(id);
}

export async function createCourse(course) {
  return window.desktop.courses.create(course);
}

export async function updateCourse(id, course) {
  return window.desktop.courses.update({
    id,
    course,
  });
}

export async function deactivateCourse(id) {
  return window.desktop.courses.deactivate(id);
}
