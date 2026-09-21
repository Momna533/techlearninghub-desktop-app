const {
  createStudentPayment,
  findStudentPaymentById,
  findEnrollmentPayments,
  getEnrollmentPaymentTotals,
} = require("../../infrastructure/database/student-payments.repository.js");

const {
  findEnrollmentById,
} = require("../../infrastructure/database/enrollments.repository.js");


function generateReceiptNumber() {
  return `REC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "card",
  "mobile_wallet",
  "other",
];

const FEE_TYPES = ["registration", "course"];

function validatePaymentInput(payment) {
  if (!payment || typeof payment !== "object") {
    throw new Error("Payment data is required.");
  }

  if (!Number.isInteger(Number(payment.enrollmentId))) {
    throw new Error("A valid enrollment is required.");
  }

  if (!FEE_TYPES.includes(payment.feeType)) {
    throw new Error("Invalid fee type.");
  }

  if (!Number.isInteger(Number(payment.amountMinor)) || Number(payment.amountMinor) <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  if (!PAYMENT_METHODS.includes(payment.paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  if (!payment.paidAt) {
    throw new Error("Payment date is required.");
  }
}

function createPayment(payment) {
  validatePaymentInput(payment);

  const enrollment = findEnrollmentById(payment.enrollmentId);

  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  const totals = getEnrollmentPaymentTotals(payment.enrollmentId);

  const amountMinor = Number(payment.amountMinor);

  if (payment.feeType === "registration") {
    const registrationFeeMinor = Number(
      enrollment.registrationFeeMinor || 0,
    );

    const registrationRemainingMinor =
      registrationFeeMinor - totals.registrationPaidMinor;

    if (registrationRemainingMinor <= 0) {
      throw new Error("Registration fee has already been fully paid.");
    }

    if (amountMinor > registrationRemainingMinor) {
      throw new Error(
        `Registration payment cannot exceed the remaining registration fee of ${registrationRemainingMinor}.`,
      );
    }
  }

  if (payment.feeType === "course") {
    const courseFeeMinor =
      Number(enrollment.agreedFeeMinor || 0) -
      Number(enrollment.discountMinor || 0);

    const courseRemainingMinor =
      courseFeeMinor - totals.coursePaidMinor;

    if (courseRemainingMinor <= 0) {
      throw new Error("Course fee has already been fully paid.");
    }

    if (amountMinor > courseRemainingMinor) {
      throw new Error(
        `Course payment cannot exceed the remaining course fee of ${courseRemainingMinor}.`,
      );
    }
  }

return createStudentPayment({
  enrollmentId: payment.enrollmentId,
  receiptNumber: generateReceiptNumber(),
  feeType: payment.feeType,
  amountMinor,
  currencyCode: payment.currencyCode || enrollment.currencyCode,
  paymentMethod: payment.paymentMethod,
  referenceNumber: payment.referenceNumber || null,
  receivedByUserId: payment.receivedByUserId || null,
  paidAt: payment.paidAt,
  notes: payment.notes || null,
});
}

function getPaymentHistory(enrollmentId) {
  const enrollment = findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  return findEnrollmentPayments(enrollmentId);
}

function getPaymentSummary(enrollmentId) {
  const enrollment = findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  const totals = getEnrollmentPaymentTotals(enrollmentId);

  const registrationFeeMinor = Number(
    enrollment.registrationFeeMinor || 0,
  );

  const courseFeeMinor =
    Number(enrollment.agreedFeeMinor || 0) -
    Number(enrollment.discountMinor || 0);

  const registrationRemainingMinor = Math.max(
    0,
    registrationFeeMinor - totals.registrationPaidMinor,
  );

  const courseRemainingMinor = Math.max(
    0,
    courseFeeMinor - totals.coursePaidMinor,
  );

  return {
    registrationFeeMinor,
    registrationPaidMinor: totals.registrationPaidMinor,
    registrationRemainingMinor,

    courseFeeMinor,
    coursePaidMinor: totals.coursePaidMinor,
    courseRemainingMinor,

    totalPaidMinor:
      totals.registrationPaidMinor +
      totals.coursePaidMinor,
  };
}

function getPaymentById(id) {
  return findStudentPaymentById(id);
}

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentSummary,
  getPaymentById,
};