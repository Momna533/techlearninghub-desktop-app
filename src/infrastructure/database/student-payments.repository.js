const { getDatabase } = require("./connection");

function mapStudentPayment(row) {
  if (!row) return null;

  return {
    id: row.id,

    enrollmentId: row.enrollment_id,

    receiptNumber: row.receipt_number,

    feeType: row.fee_type,

    amountMinor: row.amount_minor,

    currencyCode: row.currency_code,

    paymentMethod: row.payment_method,

    referenceNumber: row.reference_number,

    receivedByUserId: row.received_by_user_id,

    paidAt: row.paid_at,

    voidedAt: row.voided_at,

    notes: row.notes,

    createdAt: row.created_at,
  };
}

function createStudentPayment(payment) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO student_payments (
        enrollment_id,
        receipt_number,
        fee_type,
        amount_minor,
        currency_code,
        payment_method,
        reference_number,
        received_by_user_id,
        paid_at,
        notes
      )
      VALUES (
        @enrollmentId,
        @receiptNumber,
        @feeType,
        @amountMinor,
        @currencyCode,
        @paymentMethod,
        @referenceNumber,
        @receivedByUserId,
        @paidAt,
        @notes
      )
      `,
    )
    .run({
      enrollmentId: payment.enrollmentId,
      receiptNumber: payment.receiptNumber,
      feeType: payment.feeType,
      amountMinor: payment.amountMinor,
      currencyCode: payment.currencyCode,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber ?? null,
      receivedByUserId: payment.receivedByUserId ?? null,
      paidAt: payment.paidAt,
      notes: payment.notes ?? null,
    });

  return findStudentPaymentById(Number(result.lastInsertRowid));
}

function findStudentPaymentById(id) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      SELECT
        id,
        enrollment_id,
        receipt_number,
        fee_type,
        amount_minor,
        currency_code,
        payment_method,
        reference_number,
        received_by_user_id,
        paid_at,
        voided_at,
        notes,
        created_at
      FROM student_payments
      WHERE id = ?
      LIMIT 1
      `,
    )
    .get(id);

  return mapStudentPayment(row);
}

function findEnrollmentPayments(enrollmentId) {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        id,
        enrollment_id,
        receipt_number,
        fee_type,
        amount_minor,
        currency_code,
        payment_method,
        reference_number,
        received_by_user_id,
        paid_at,
        voided_at,
        notes,
        created_at
      FROM student_payments
      WHERE enrollment_id = ?
      ORDER BY paid_at ASC, id ASC
      `,
    )
    .all(enrollmentId);

  return rows.map(mapStudentPayment);
}

function getEnrollmentPaymentTotals(enrollmentId) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN fee_type = 'registration'
                AND voided_at IS NULL
              THEN amount_minor
              ELSE 0
            END
          ),
          0
        ) AS registration_paid_minor,

        COALESCE(
          SUM(
            CASE
              WHEN fee_type = 'course'
                AND voided_at IS NULL
              THEN amount_minor
              ELSE 0
            END
          ),
          0
        ) AS course_paid_minor

      FROM student_payments
      WHERE enrollment_id = ?
      `,
    )
    .get(enrollmentId);

  return {
    registrationPaidMinor: Number(row.registration_paid_minor || 0),
    coursePaidMinor: Number(row.course_paid_minor || 0),
  };
}

module.exports = {
  mapStudentPayment,
  createStudentPayment,
  findStudentPaymentById,
  findEnrollmentPayments,
  getEnrollmentPaymentTotals,
};