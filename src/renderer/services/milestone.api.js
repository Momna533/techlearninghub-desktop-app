export async function listMilestones(filters = {}) {
  return window.desktop.milestones.list(filters);
}

export async function getMilestone(id) {
  return window.desktop.milestones.get(id);
}

export async function createMilestone(milestone) {
  return window.desktop.milestones.create(milestone);
}

export async function updateMilestone(id, milestone) {
  return window.desktop.milestones.update({
    id,
    milestone,
  });
}

export async function changeMilestoneStatus(id, status) {
  return window.desktop.milestones.changeStatus({
    id,
    status,
  });
}
