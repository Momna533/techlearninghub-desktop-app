export async function listTeamMembers(filters = {}) {
  return window.desktop.teamMembers.list(filters);
}

export async function getTeamMember(id) {
  return window.desktop.teamMembers.get(id);
}

export async function createTeamMember(member) {
  return window.desktop.teamMembers.create(member);
}

export async function updateTeamMember(id, member) {
  return window.desktop.teamMembers.update({ id, member });
}

export async function removeTeamMember(id) {
  return window.desktop.teamMembers.remove(id);
}