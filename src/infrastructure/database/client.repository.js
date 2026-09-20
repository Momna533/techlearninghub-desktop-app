const { getDatabase } = require('./connection');

function findClients({ search = '', status = 'all' } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        client_code LIKE $search
        OR name LIKE $search
        OR contact_name LIKE $search
        OR phone LIKE $search
        OR email LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (status !== 'all') {
    conditions.push('status = $status');
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return database
    .prepare(`
      SELECT
        id,
        client_code,
        name,
        contact_name,
        email,
        phone,
        billing_address,
        tax_identifier,
        status,
        notes,
        created_at,
        updated_at
      FROM clients
      ${whereClause}
      ORDER BY name ASC
    `)
    .all(parameters);
}

function findClientById(id) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        id,
        client_code,
        name,
        contact_name,
        email,
        phone,
        billing_address,
        tax_identifier,
        status,
        notes,
        created_at,
        updated_at
      FROM clients
      WHERE id = ?
      LIMIT 1
    `)
    .get(id);
}

function findClientByCode(clientCode) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        id,
        client_code,
        name,
        contact_name,
        email,
        phone,
        billing_address,
        tax_identifier,
        status,
        notes,
        created_at,
        updated_at
      FROM clients
      WHERE client_code = ?
      LIMIT 1
    `)
    .get(clientCode.trim());
}

function createClient(client) {
  const database = getDatabase();

  const result = database
    .prepare(`
      INSERT INTO clients (
        client_code,
        name,
        contact_name,
        email,
        phone,
        billing_address,
        tax_identifier,
        status,
        notes
      )
      VALUES (
        @clientCode,
        @name,
        @contactName,
        @email,
        @phone,
        @billingAddress,
        @taxIdentifier,
        @status,
        @notes
      )
    `)
    .run({
      clientCode: client.clientCode,
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billingAddress,
      taxIdentifier: client.taxIdentifier,
      status: client.status,
      notes: client.notes,
    });

  return findClientById(Number(result.lastInsertRowid));
}

function updateClient(id, client) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE clients
      SET
        client_code = @clientCode,
        name = @name,
        contact_name = @contactName,
        email = @email,
        phone = @phone,
        billing_address = @billingAddress,
        tax_identifier = @taxIdentifier,
        status = @status,
        notes = @notes,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
    .run({
      id,
      clientCode: client.clientCode,
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billingAddress,
      taxIdentifier: client.taxIdentifier,
      status: client.status,
      notes: client.notes,
    });

  return findClientById(id);
}

function deactivateClient(id) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE clients
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  return findClientById(id);
}

function archiveClient(id) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE clients
      SET
        status = 'archived',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  return findClientById(id);
}

module.exports = {
  findClients,
  findClientById,
  findClientByCode,
  createClient,
  updateClient,
  deactivateClient,
  archiveClient,
};