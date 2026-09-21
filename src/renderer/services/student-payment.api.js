export async function createStudentPayment(payment) {
  return window.desktop.studentPayments.create(payment);
}

export async function listStudentPayments(enrollmentId) {
  return window.desktop.studentPayments.list(enrollmentId);
}

export async function getStudentPaymentSummary(enrollmentId) {
  return window.desktop.studentPayments.summary(enrollmentId);
}

export async function getStudentPayment(id) {
  return window.desktop.studentPayments.get(id);
}