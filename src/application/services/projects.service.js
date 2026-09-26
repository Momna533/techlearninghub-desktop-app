const {
  findProjects,
  findProjectById,
  findProjectByCode,
  createProject,
  updateProject,
  updateProjectStatus,
} = require("../../infrastructure/database/projects.repository");

const VALID_STATUSES = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];

function normalizeOptionalValue(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return value;
}

function validateProjectInput(project) {
  if (!project) {
    throw new Error("Project data is required.");
  }

  if (!project.clientId) {
    throw new Error("Client is required.");
  }

  if (!project.projectCode || !project.projectCode.trim()) {
    throw new Error("Project code is required.");
  }

  if (!project.name || !project.name.trim()) {
    throw new Error("Project name is required.");
  }

  if (!project.startDate) {
    throw new Error("Start date is required.");
  }

  if (!project.currencyCode || !project.currencyCode.trim()) {
    throw new Error("Currency code is required.");
  }

  if (!VALID_STATUSES.includes(project.status)) {
    throw new Error("Invalid project status.");
  }

  if (project.endDate && project.endDate < project.startDate) {
    throw new Error("End date cannot be before start date.");
  }

  if (
    project.budgetMinor !== null &&
    project.budgetMinor !== undefined &&
    project.budgetMinor !== "" &&
    (!Number.isInteger(Number(project.budgetMinor)) ||
      Number(project.budgetMinor) < 0)
  ) {
    throw new Error("Budget must be a valid non-negative amount.");
  }

  if (
    project.contractValueMinor !== null &&
    project.contractValueMinor !== undefined &&
    project.contractValueMinor !== "" &&
    (!Number.isInteger(Number(project.contractValueMinor)) ||
      Number(project.contractValueMinor) < 0)
  ) {
    throw new Error("Contract value must be a valid non-negative amount.");
  }
}

function prepareProject(project) {
  return {
    clientId: Number(project.clientId),

    proposalId: normalizeOptionalValue(project.proposalId),

    projectManagerEmployeeId: normalizeOptionalValue(
      project.projectManagerEmployeeId,
    ),

    projectCode: project.projectCode.trim(),

    name: project.name.trim(),

    description: normalizeOptionalValue(project.description),

    status: project.status,

    startDate: project.startDate,

    endDate: normalizeOptionalValue(project.endDate),

    budgetMinor:
      project.budgetMinor === "" ||
      project.budgetMinor === undefined ||
      project.budgetMinor === null
        ? null
        : Number(project.budgetMinor),

    contractValueMinor:
      project.contractValueMinor === "" ||
      project.contractValueMinor === undefined ||
      project.contractValueMinor === null
        ? null
        : Number(project.contractValueMinor),

    currencyCode: project.currencyCode.trim().toUpperCase(),
  };
}

function getProjects(filters = {}) {
  return findProjects(filters);
}

function getProject(id) {
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("Invalid project ID.");
  }

  const project = findProjectById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

function createNewProject(project) {
  validateProjectInput(project);

  const preparedProject = prepareProject(project);

  const existingProject = findProjectByCode(preparedProject.projectCode);

  if (existingProject) {
    throw new Error(
      `Project code "${preparedProject.projectCode}" already exists.`,
    );
  }

  return createProject(preparedProject);
}

function editProject(id, project) {
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("Invalid project ID.");
  }

  const existingProject = findProjectById(projectId);

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  validateProjectInput(project);

  const preparedProject = prepareProject(project);

  const projectWithSameCode = findProjectByCode(preparedProject.projectCode);

  if (projectWithSameCode && projectWithSameCode.id !== projectId) {
    throw new Error(
      `Project code "${preparedProject.projectCode}" already exists.`,
    );
  }

  return updateProject(projectId, preparedProject);
}

function changeProjectStatus(id, status) {
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("Invalid project ID.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid project status.");
  }

  const existingProject = findProjectById(projectId);

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  return updateProjectStatus(projectId, status);
}

module.exports = {
  getProjects,
  getProject,
  createNewProject,
  editProject,
  changeProjectStatus,
};
