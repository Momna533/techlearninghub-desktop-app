export async function listProjectMembers(filters = {}) {
  return window.desktop.projectMembers.list(filters);
}

export async function getProjectMember(id) {
  return window.desktop.projectMembers.get(id);
}

export async function createProjectMember(member) {
  return window.desktop.projectMembers.create(member);
}

export async function updateProjectMember(id, member) {
  return window.desktop.projectMembers.update({
    id,
    member,
  });
}

export async function removeProjectMember(id) {
  return window.desktop.projectMembers.remove(id);
}
