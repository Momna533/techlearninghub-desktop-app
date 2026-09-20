
import { useEffect, useState } from "react";

import {
  createClient,
  updateClient,
} from "../../services/client.api";

const EMPTY_FORM = {
  clientCode: "",
  name: "",
  contactName: "",
  email: "",
  phone: "",
  billingAddress: "",
  taxIdentifier: "",
  status: "active",
  notes: "",
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const ERROR_INPUT_CLASS =
  "w-full rounded-lg border border-rose-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function ClientForm({
  client = null,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const isEditing = Boolean(client?.id);

  useEffect(() => {
    if (!client) {
      setForm(EMPTY_FORM);
      setErrors({});
      setServerError("");
      return;
    }

    setForm({
      clientCode: client.client_code || "",
      name: client.name || "",
      contactName: client.contact_name || "",
      email: client.email || "",
      phone: client.phone || "",
      billingAddress: client.billing_address || "",
      taxIdentifier: client.tax_identifier || "",
      status: client.status || "active",
      notes: client.notes || "",
    });

    setErrors({});
    setServerError("");
  }, [client]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setServerError("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.clientCode.trim()) {
      nextErrors.clientCode = "Client code is required.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Client/company name is required.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!["active", "inactive", "archived"].includes(form.status)) {
      nextErrors.status = "Invalid client status.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const clientData = {
        clientCode: form.clientCode,
        name: form.name,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        billingAddress: form.billingAddress,
        taxIdentifier: form.taxIdentifier,
        status: form.status,
        notes: form.notes,
      };

      const result = isEditing
        ? await updateClient(client.id, clientData)
        : await createClient(clientData);

      if (!result.success) {
        if (result.code === "VALIDATION_ERROR" && result.details) {
          setErrors(result.details);
          return;
        }

        setServerError(
          result.message ||
            `Unable to ${isEditing ? "update" : "create"} client.`,
        );
        return;
      }

      onSuccess(result.client);
    } catch (error) {
      console.error("[ClientForm] Submit failed:", error);
      setServerError("Something went wrong while saving the client.");
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
            <p className="font-medium">Unable to save client</p>
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
            Enter the client's company and identification details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="clientCode"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Client Code
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="clientCode"
              name="clientCode"
              value={form.clientCode}
              onChange={handleChange}
              disabled={submitting}
              placeholder="e.g. CLI-001"
              autoComplete="off"
              className={
                errors.clientCode
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError("clientCode")}
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
              <option value="archived">Archived</option>
            </select>

            {renderFieldError("status")}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Company / Client Name
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter company or client name"
              autoComplete="organization"
              className={
                errors.name
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError("name")}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Contact Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Add the main contact person's details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contactName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Contact Person
            </label>

            <input
              id="contactName"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter contact person's name"
              autoComplete="name"
              className={
                errors.contactName
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError("contactName")}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Phone
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

            {renderFieldError("phone")}
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
              placeholder="client@example.com"
              autoComplete="email"
              className={
                errors.email
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError("email")}
          </div>

          <div>
            <label
              htmlFor="taxIdentifier"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tax Identifier
            </label>

            <input
              id="taxIdentifier"
              name="taxIdentifier"
              value={form.taxIdentifier}
              onChange={handleChange}
              disabled={submitting}
              placeholder="NTN / Tax ID"
              autoComplete="off"
              className={
                errors.taxIdentifier
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }
            />

            {renderFieldError("taxIdentifier")}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Billing & Additional Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Store billing details and any useful notes about this client.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="billingAddress"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Billing Address
            </label>

            <textarea
              id="billingAddress"
              name="billingAddress"
              value={form.billingAddress}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Enter billing address"
              rows={3}
              className={`resize-y ${
                errors.billingAddress
                  ? ERROR_INPUT_CLASS
                  : INPUT_CLASS
              }`}
            />

            {renderFieldError("billingAddress")}
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

            {renderFieldError("notes")}
          </div>
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
              {isEditing ? "Saving..." : "Saving..."}
            </>
          ) : isEditing ? (
            "Update Client"
          ) : (
            "Add Client"
          )}
        </button>
      </div>
    </form>
  );
}

export default ClientForm;
