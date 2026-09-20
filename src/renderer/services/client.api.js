export async function listClients(filters = {}) {
  return window.desktop.clients.list(filters);
}

export async function getClient(id) {
  return window.desktop.clients.get(id);
}

export async function createClient(client) {
  return window.desktop.clients.create(client);
}

export async function updateClient(id, client) {
  return window.desktop.clients.update({
    id,
    client,
  });
}

export async function deactivateClient(id) {
  return window.desktop.clients.deactivate(id);
}

export async function archiveClient(id) {
  return window.desktop.clients.archive(id);
}