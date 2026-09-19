export async function listEnrollments(filters = {}) {
  return window.desktop.enrollments.list(filters);
}

export async function getEnrollment(id) {
  return window.desktop.enrollments.get(id);
}

export async function getStudentEnrollments(studentId) {
  return window.desktop.enrollments.getByStudent(studentId);
}

export async function getBatchEnrollments(batchId) {
  return window.desktop.enrollments.getByBatch(batchId);
}

export async function createEnrollment(enrollment) {
  return window.desktop.enrollments.create(enrollment);
}

export async function updateEnrollment(id, enrollment) {
  return window.desktop.enrollments.update({
    id,
    enrollment,
  });
}

export async function updateEnrollmentStatus(id, status) {
  return window.desktop.enrollments.updateStatus({
    id,
    status,
  });
}
