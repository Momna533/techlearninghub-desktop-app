
import { useEffect, useState } from "react";

import {
  listClients,
  getClient,
  deactivateClient,
  archiveClient,
} from "../services/client.api";

import ClientForm from "../components/clients/ClientForm";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);

  async function loadClients() {
    setLoading(true);
    setError("");

    try {
      const result = await listClients({
        search,
        status,
      });

      if (!result.success) {
        setError(result.message || "Failed to load clients.");
        setClients([]);
        setLoading(false);
        return;
      }

      setClients(result.clients);
    } catch (error) {
      console.error("[ClientsPage] Failed to load clients:", error);
      setError("Failed to load clients.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, [search, status]);

  function handleCreate() {
    setEditingClient(null);
    setSelectedClient(null);
    setShowForm(true);
    setError("");
  }

  async function handleEdit(client) {
    setError("");

    try {
      const result = await getClient(client.id);

      if (!result.success) {
        setError(result.message || "Unable to load client.");
        return;
      }

      setEditingClient(result);
      setSelectedClient(null);
      setShowForm(true);
    } catch (error) {
      console.error("[ClientsPage] Failed to load client:", error);
      setError("Unable to load client.");
    }
  }

  async function handleView(clientId) {
    setLoadingClient(true);
    setError("");

    try {
      const result = await getClient(clientId);

      if (!result.success) {
        setError(result.message || "Failed to load client.");
        return;
      }

      setSelectedClient(result.client);
      setShowForm(false);
    } catch (error) {
      console.error("[ClientsPage] Failed to load client:", error);
      setError("Failed to load client.");
    } finally {
      setLoadingClient(false);
    }
  }

  async function handleDeactivate(id) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this client?",
    );

    if (!confirmed) return;

    setError("");

    try {
      const result = await deactivateClient(id);

      if (!result.success) {
        setError(result.message || "Failed to deactivate client.");
        return;
      }

      await loadClients();

      if (selectedClient?.id === id) {
        setSelectedClient(result.client);
      }
    } catch (error) {
      console.error("[ClientsPage] Failed to deactivate client:", error);
      setError("Failed to deactivate client.");
    }
  }

  async function handleArchive(id) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this client?",
    );

    if (!confirmed) return;

    setError("");

    try {
      const result = await archiveClient(id);

      if (!result.success) {
        setError(result.message || "Failed to archive client.");
        return;
      }

      await loadClients();

      if (selectedClient?.id === id) {
        setSelectedClient(result.client);
      }
    } catch (error) {
      console.error("[ClientsPage] Failed to archive client:", error);
      setError("Failed to archive client.");
    }
  }

  async function handleFormSuccess() {
    setShowForm(false);
    setEditingClient(null);
    setError("");

    await loadClients();
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingClient(null);
  }

  function handleCloseClient() {
    setSelectedClient(null);
  }

  function getStatusClasses(clientStatus) {
    switch (clientStatus) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";

      case "inactive":
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";

      case "archived":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
    }
  }

  function formatStatus(clientStatus) {
    return clientStatus.charAt(0).toUpperCase() + clientStatus.slice(1);
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Software House</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Clients
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage client records and business information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:w-auto"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Add Client
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="mt-0.5 font-semibold">!</span>

            <p>{error}</p>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full lg:flex-1">
              <label
                htmlFor="client-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <input
                id="client-search"
                type="search"
                placeholder="Search by code, name, contact, phone or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="client-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="client-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </section>

        {loadingClient && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
            Loading client...
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Client Records
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {clients.length}{" "}
                {clients.length === 1 ? "client" : "clients"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

              <p className="mt-3 text-sm text-slate-500">
                Loading clients...
              </p>
            </div>
          ) : clients.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                —
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No clients found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {search || status !== "all"
                  ? "Try changing your search or filter."
                  : "Add your first client to start managing your software house clients."}
              </p>

              {!search && status === "all" && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add Client
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Client
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {clients.map((client) => (
                      <tr
                        key={client.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {client.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {client.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {client.client_code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {client.contact_name || "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {client.phone || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(client.status)}`}
                          >
                            {formatStatus(client.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {formatDate(client.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleView(client.id)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(client)}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeactivate(client.id)}
                              disabled={client.status !== "active"}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Deactivate
                            </button>

                            <button
                              type="button"
                              onClick={() => handleArchive(client.id)}
                              disabled={client.status === "archived"}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 md:hidden">
                {clients.map((client) => (
                  <div key={client.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {client.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {client.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {client.client_code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(client.status)}`}
                      >
                        {formatStatus(client.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Contact
                        </p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {client.contact_name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Phone
                        </p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {client.phone || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Created
                        </p>

                        <p className="mt-0.5 text-sm text-slate-700">
                          {formatDate(client.created_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Email
                        </p>

                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {client.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleView(client.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(client.id)}
                        disabled={client.status !== "active"}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Deactivate
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchive(client.id)}
                        disabled={client.status === "archived"}
                        className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-form-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="client-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingClient ? "Edit Client" : "Add Client"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingClient
                    ? "Update the client information below."
                    : "Enter the client information below."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <ClientForm
                client={editingClient?.client || null}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseClient();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-view-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                  {selectedClient.name?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="client-view-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      {selectedClient.name}
                    </h2>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(selectedClient.status)}`}
                    >
                      {formatStatus(selectedClient.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedClient.client_code}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseClient}
                className="self-start flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Contact Person
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedClient.contact_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedClient.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-words text-sm text-slate-900">
                  {selectedClient.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Tax Identifier
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {selectedClient.tax_identifier || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Created
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedClient.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Updated
                </p>

                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedClient.updated_at)}
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Billing Address
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                  {selectedClient.billing_address || "-"}
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                  {selectedClient.notes || "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => handleEdit(selectedClient)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit Client
              </button>

              <button
                type="button"
                onClick={() => handleDeactivate(selectedClient.id)}
                disabled={selectedClient.status !== "active"}
                className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Deactivate
              </button>

              <button
                type="button"
                onClick={() => handleArchive(selectedClient.id)}
                disabled={selectedClient.status === "archived"}
                className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;
