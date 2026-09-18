
import { useEffect, useState } from 'react';

import {
  createStudent,
  updateStudent,
} from '../../services/student.api';

const EMPTY_FORM = {
  studentCode: '',
  firstName: '',
  lastName: '',
  guardianName: '',
  guardianPhone: '',
  phone: '',
  email: '',
  address: '',
  dateOfBirth: '',
  status: 'active',
  notes: '',
};

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const ERROR_INPUT_CLASS =
  'w-full rounded-lg border border-rose-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50';

function StudentForm({ student = null, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEditing = Boolean(student);

  useEffect(() => {
    if (!student) {
      setForm(EMPTY_FORM);
      setErrors({});
      setServerError('');
      return;
    }

    setForm({
      studentCode: student.student_code || '',
      firstName: student.first_name || '',
      lastName: student.last_name || '',
      guardianName: student.guardian_name || '',
      guardianPhone: student.guardian_phone || '',
      phone: student.phone || '',
      email: student.email || '',
      address: student.address || '',
      dateOfBirth: student.date_of_birth || '',
      status: student.status || 'active',
      notes: student.notes || '',
    });

    setErrors({});
    setServerError('');
  }, [student]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));

    setServerError('');
  }

  function validate() {
    const nextErrors = {};

    if (!form.studentCode.trim()) {
      nextErrors.studentCode = 'Student ID is required.';
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.guardianName.trim()) {
      nextErrors.guardianName = 'Guardian/father name is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    }

    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = 'Enter a valid email address.';
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError('');

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const result = isEditing
        ? await updateStudent(student.id, form)
        : await createStudent(form);

      if (!result.success) {
        if (result.code === 'VALIDATION_ERROR' && result.details) {
          setErrors(result.details);
          return;
        }

        setServerError(
          result.message || 'Unable to save student.'
        );

        return;
      }

      onSuccess(result.student);
    } catch (error) {
      console.error('[StudentForm] Submit failed:', error);

      setServerError(
        'Something went wrong while saving the student.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderFieldError(field) {
    if (!errors[field]) return null;

    return (
      <p className="mt-1.5 text-xs font-medium text-rose-600">
        {errors[field]}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">
            !
          </div>

          <div>
            <p className="font-medium">
              Unable to save student
            </p>

            <p className="mt-0.5 text-rose-600">
              {serverError}
            </p>
          </div>
        </div>
      )}

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Basic Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Enter the student's identification and personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="studentCode"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Student ID
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="studentCode"
              name="studentCode"
              value={form.studentCode}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. STU-001"
              autoComplete="off"
              className={
                errors.studentCode
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('studentCode')}
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Status
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={submitting}
              className={
                errors.status
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            {renderFieldError('status')}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              First Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter first name"
              autoComplete="given-name"
              className={
                errors.firstName
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('firstName')}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Last Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter last name"
              autoComplete="family-name"
              className={
                errors.lastName
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('lastName')}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Date of Birth
            </label>

            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              disabled={submitting}
              className={
                errors.dateOfBirth
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('dateOfBirth')}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Contact & Guardian Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Add the student's contact details and guardian information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="guardianName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Guardian / Father Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="guardianName"
              name="guardianName"
              value={form.guardianName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter guardian name"
              autoComplete="name"
              className={
                errors.guardianName
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('guardianName')}
          </div>

          <div>
            <label
              htmlFor="guardianPhone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Guardian Phone
            </label>

            <input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              value={form.guardianPhone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. 0300 1234567"
              autoComplete="tel"
              className={
                errors.guardianPhone
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('guardianPhone')}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Student Phone
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. 0300 1234567"
              autoComplete="tel"
              className={
                errors.phone
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('phone')}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              placeholder="student@example.com"
              autoComplete="email"
              className={
                errors.email
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError('email')}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter residential address"
              rows={3}
              className={`resize-y ${
                errors.address
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }`}
            />

            {renderFieldError('address')}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Additional Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Add any useful notes about this student.
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Add notes, remarks or additional information..."
            rows={4}
            className={`resize-y ${
              errors.notes
                ? ERROR_INPUT_CLASS
                : INPUT_CLASS
            }`}
          />

          {renderFieldError('notes')}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            isEditing
              ? 'Update Student'
              : 'Create Student'
          )}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
