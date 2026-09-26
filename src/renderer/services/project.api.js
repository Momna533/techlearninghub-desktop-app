export async function listProjects(filters = {}) {
  return window.desktop.projects.list(filters);
}

export async function getProject(id) {
  return window.desktop.projects.get(id);
}

export async function createProject(project) {
  return window.desktop.projects.create(project);
}

export async function updateProject(id, project) {
  return window.desktop.projects.update({
    id,
    project,
  });
}

export async function changeProjectStatus(id, status) {
  return window.desktop.projects.changeStatus({
    id,
    status,
  });
}
