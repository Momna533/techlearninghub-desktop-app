const {
  findClients,
  findClientById,
  findClientByCode,
  createClient,
  updateClient,
  deactivateClient,
  archiveClient,
} = require('../../infrastructure/database/client.repository');

const CLIENT_STATUSES = ['active', 'inactive', 'archived'];

function normalizeClientInput(client = {}) {
  return {
    clientCode: String(client.clientCode ?? '').trim(),
    name: String(client.name ?? '').trim(),
    contactName: String(client.contactName ?? '').trim(),
    email: String(client.email ?? '').trim(),
    phone: String(client.phone ?? '').trim(),
    billingAddress: String(client.billingAddress ?? '').trim(),
    taxIdentifier: String(client.taxIdentifier ?? '').trim(),
    status: String(client.status ?? 'active').trim(),
    notes: String(client.notes ?? '').trim(),
  };
}

function validateClient(client) {
  if (!client.clientCode) {
    throw new Error('Client code is required.');
  }

  if (!client.name) {
    throw new Error('Client name is required.');
  }

  if (!CLIENT_STATUSES.includes(client.status)) {
    throw new Error('Invalid client status.');
  }

  if (
    client.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)
  ) {
    throw new Error('Invalid email address.');
  }
}

function listClients({ search = '', status = 'all' } = {}) {
  if (!['all', ...CLIENT_STATUSES].includes(status)) {
    throw new Error('Invalid client status filter.');
  }

  return findClients({
    search: String(search ?? ''),
    status,
  });
}

function getClientById(id) {
  const clientId = Number(id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    throw new Error('Invalid client ID.');
  }

  const client = findClientById(clientId);

  if (!client) {
    throw new Error('Client not found.');
  }

  return client;
}

function createNewClient(input) {
  const client = normalizeClientInput(input);

  validateClient(client);

  const existingClient = findClientByCode(client.clientCode);

  if (existingClient) {
    throw new Error('A client with this client code already exists.');
  }

  return createClient(client);
}

function updateExistingClient(id, input) {
  const clientId = Number(id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    throw new Error('Invalid client ID.');
  }

  const existingClient = findClientById(clientId);

  if (!existingClient) {
    throw new Error('Client not found.');
  }

  const client = normalizeClientInput(input);

  validateClient(client);

  const clientWithSameCode = findClientByCode(client.clientCode);

  if (
    clientWithSameCode &&
    Number(clientWithSameCode.id) !== clientId
  ) {
    throw new Error('A client with this client code already exists.');
  }

  return updateClient(clientId, client);
}

function deactivateExistingClient(id) {
  const clientId = Number(id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    throw new Error('Invalid client ID.');
  }

  const existingClient = findClientById(clientId);

  if (!existingClient) {
    throw new Error('Client not found.');
  }

  if (existingClient.status === 'inactive') {
    return existingClient;
  }

  return deactivateClient(clientId);
}

function archiveExistingClient(id) {
  const clientId = Number(id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    throw new Error('Invalid client ID.');
  }

  const existingClient = findClientById(clientId);

  if (!existingClient) {
    throw new Error('Client not found.');
  }

  if (existingClient.status === 'archived') {
    return existingClient;
  }

  return archiveClient(clientId);
}

module.exports = {
  listClients,
  getClientById,
  createNewClient,
  updateExistingClient,
  deactivateExistingClient,
  archiveExistingClient,
};