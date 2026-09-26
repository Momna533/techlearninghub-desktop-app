const {
  findMilestones,
  findMilestoneById,
  findMilestoneByProjectAndName,
  findMilestoneByProjectAndSortOrder,
  getNextMilestoneSortOrder,
  createMilestone,
  updateMilestone,
  updateMilestoneStatus,
} = require("../../infrastructure/database/milestones.repository");

const {
  findProjectById,
} = require("../../infrastructure/database/projects.repository");

const VALID_STATUSES = ["planned", "in_progress", "completed", "cancelled"];

function normalizeMilestoneInput(milestone = {}) {
  return {
    projectId:
      milestone.projectId === "" ||
      milestone.projectId === null ||
      milestone.projectId === undefined
        ? null
        : Number(milestone.projectId),

    name: String(milestone.name ?? "").trim(),

    description: String(milestone.description ?? "").trim() || null,

    status: String(milestone.status ?? "planned").trim(),

    dueDate: String(milestone.dueDate ?? "").trim() || null,

    completedAt: String(milestone.completedAt ?? "").trim() || null,

    amountMinor:
      milestone.amountMinor === "" ||
      milestone.amountMinor === null ||
      milestone.amountMinor === undefined
        ? null
        : Number(milestone.amountMinor),

    sortOrder:
      milestone.sortOrder === "" ||
      milestone.sortOrder === null ||
      milestone.sortOrder === undefined
        ? null
        : Number(milestone.sortOrder),
  };
}

function validateDateOrder(milestone) {
  if (milestone.dueDate && milestone.completedAt) {
    const dueDate = milestone.dueDate.slice(0, 10);

    const completedDate = milestone.completedAt.slice(0, 10);

    if (completedDate < dueDate) {
      throw new Error("Completed date cannot be before the due date.");
    }
  }
}

function validateMilestone(milestone) {
  if (!Number.isInteger(milestone.projectId) || milestone.projectId <= 0) {
    throw new Error("A valid project is required.");
  }

  if (!milestone.name) {
    throw new Error("Milestone name is required.");
  }

  if (!VALID_STATUSES.includes(milestone.status)) {
    throw new Error("Invalid milestone status.");
  }

  if (
    milestone.amountMinor !== null &&
    (!Number.isInteger(milestone.amountMinor) || milestone.amountMinor < 0)
  ) {
    throw new Error(
      "Amount must be a non-negative whole number in minor currency units.",
    );
  }

  if (
    milestone.sortOrder !== null &&
    (!Number.isInteger(milestone.sortOrder) || milestone.sortOrder < 0)
  ) {
    throw new Error("Sort order must be a non-negative whole number.");
  }

  if (milestone.status === "completed" && !milestone.completedAt) {
    throw new Error(
      "Completed date is required when a milestone is completed.",
    );
  }

  if (milestone.status !== "completed" && milestone.completedAt) {
    throw new Error(
      "Completed date can only be set for a completed milestone.",
    );
  }

  validateDateOrder(milestone);
}

function listMilestones({
  search = "",
  projectId = "all",
  status = "all",
} = {}) {
  if (
    projectId !== "all" &&
    (!Number.isInteger(Number(projectId)) || Number(projectId) <= 0)
  ) {
    throw new Error("Invalid project filter.");
  }

  if (status !== "all" && !VALID_STATUSES.includes(status)) {
    throw new Error("Invalid milestone status filter.");
  }

  return findMilestones({
    search: String(search ?? ""),
    projectId,
    status,
  });
}

function getMilestoneById(id) {
  const milestoneId = Number(id);

  if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
    throw new Error("Invalid milestone ID.");
  }

  const milestone = findMilestoneById(milestoneId);

  if (!milestone) {
    throw new Error("Milestone not found.");
  }

  return milestone;
}

function createNewMilestone(input) {
  const milestone = normalizeMilestoneInput(input);

  validateMilestone(milestone);

  const project = findProjectById(milestone.projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const duplicateName = findMilestoneByProjectAndName(
    milestone.projectId,
    milestone.name,
  );

  if (duplicateName) {
    throw new Error(
      "A milestone with this name already exists in this project.",
    );
  }

  let sortOrder = milestone.sortOrder;

  if (sortOrder === null) {
    sortOrder = getNextMilestoneSortOrder(milestone.projectId);
  } else {
    const duplicateOrder = findMilestoneByProjectAndSortOrder(
      milestone.projectId,
      sortOrder,
    );

    if (duplicateOrder) {
      throw new Error(
        "This sort order is already used by another milestone in this project.",
      );
    }
  }

  return createMilestone({
    ...milestone,
    sortOrder,
  });
}

function updateExistingMilestone(id, input) {
  const milestoneId = Number(id);

  if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
    throw new Error("Invalid milestone ID.");
  }

  const existingMilestone = findMilestoneById(milestoneId);

  if (!existingMilestone) {
    throw new Error("Milestone not found.");
  }

  const milestone = normalizeMilestoneInput(input);

  validateMilestone(milestone);

  const project = findProjectById(milestone.projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const duplicateName = findMilestoneByProjectAndName(
    milestone.projectId,
    milestone.name,
    milestoneId,
  );

  if (duplicateName) {
    throw new Error(
      "A milestone with this name already exists in this project.",
    );
  }

  let sortOrder = milestone.sortOrder;

  /*
   * If no sort order is supplied while editing,
   * preserve the existing position when staying
   * in the same project.
   */
  if (
    sortOrder === null &&
    Number(existingMilestone.project_id) === milestone.projectId
  ) {
    sortOrder = Number(existingMilestone.sort_order);
  }

  /*
   * If the milestone is moved to another project
   * and no sort order is supplied, give it the
   * next available position in that project.
   */
  if (sortOrder === null) {
    sortOrder = getNextMilestoneSortOrder(milestone.projectId);
  }

  const duplicateOrder = findMilestoneByProjectAndSortOrder(
    milestone.projectId,
    sortOrder,
    milestoneId,
  );

  if (duplicateOrder) {
    throw new Error(
      "This sort order is already used by another milestone in this project.",
    );
  }

  return updateMilestone(milestoneId, {
    ...milestone,
    sortOrder,
  });
}

function changeMilestoneStatus(id, status) {
  const milestoneId = Number(id);

  if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
    throw new Error("Invalid milestone ID.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid milestone status.");
  }

  const existingMilestone = findMilestoneById(milestoneId);

  if (!existingMilestone) {
    throw new Error("Milestone not found.");
  }

  let completedAt = existingMilestone.completed_at;

  if (status === "completed") {
    completedAt = new Date().toISOString();
  } else {
    completedAt = null;
  }

  return updateMilestoneStatus(milestoneId, status, completedAt);
}

module.exports = {
  listMilestones,
  getMilestoneById,
  createNewMilestone,
  updateExistingMilestone,
  changeMilestoneStatus,
};
