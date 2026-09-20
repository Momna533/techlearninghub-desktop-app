export async function listTeams(filters = {}) {
  return window.desktop.teams.list(filters);
}

export async function getTeam(id) {
  return window.desktop.teams.get(id);
}

export async function createTeam(team) {
  return window.desktop.teams.create(team);
}

export async function updateTeam(id, team) {
  return window.desktop.teams.update({
    id,
    team,
  });
}

export async function deactivateTeam(id) {
  return window.desktop.teams.deactivate(id);
}

export async function archiveTeam(id) {
  return window.desktop.teams.archive(id);
}