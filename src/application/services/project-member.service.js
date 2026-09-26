const {
  findProjectMembers,
  findProjectMemberById,
  findActiveProjectMembership,
  createProjectMember,
  updateProjectMember,
  removeProjectMember,
} = require("../../infrastructure/database/project-members.repository");

const {
  findEmployeeById,
} = require("../../infrastructure/database/employee.repository");

const {
  findProjectById,
} = require("../../infrastructure/database/projects.repository");

function normalizeProjectMemberInput(member = {}) {
  return {
    projectId:
      member.projectId === "" ||
      member.projectId === null ||
      member.projectId === undefined
        ? null
        : Number(member.projectId),

    employeeId:
      member.employeeId === "" ||
      member.employeeId === null ||
      member.employeeId === undefined
        ? null
        : Number(member.employeeId),

    roleOnProject: String(member.roleOnProject ?? "").trim(),

    allocationPercent:
      member.allocationPercent === "" ||
      member.allocationPercent === null ||
      member.allocationPercent === undefined
        ? null
        : Number(member.allocationPercent),

    joinedAt: String(member.joinedAt ?? "").trim(),

    leftAt: String(member.leftAt ?? "").trim() || null,
  };
}

function validateProjectMember(member) {
  if (!Number.isInteger(member.projectId) || member.projectId <= 0) {
    throw new Error("A valid project is required.");
  }

  if (!Number.isInteger(member.employeeId) || member.employeeId <= 0) {
    throw new Error("A valid employee is required.");
  }

  if (!member.roleOnProject) {
    throw new Error("Role on project is required.");
  }

  if (
    member.allocationPercent !== null &&
    (!Number.isInteger(member.allocationPercent) ||
      member.allocationPercent < 0 ||
      member.allocationPercent > 100)
  ) {
    throw new Error("Allocation must be a whole number between 0 and 100.");
  }

  if (!member.joinedAt) {
    throw new Error("Joined date is required.");
  }

  if (member.leftAt && member.leftAt < member.joinedAt) {
    throw new Error("Left date cannot be before joined date.");
  }
}

function listProjectMembers({ search = "", projectId = "all" } = {}) {
  if (
    projectId !== "all" &&
    (!Number.isInteger(Number(projectId)) || Number(projectId) <= 0)
  ) {
    throw new Error("Invalid project filter.");
  }

  return findProjectMembers({
    search: String(search ?? ""),
    projectId,
  });
}

function getProjectMemberById(id) {
  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    throw new Error("Invalid project member ID.");
  }

  const member = findProjectMemberById(memberId);

  if (!member) {
    throw new Error("Project member not found.");
  }

  return member;
}

function createNewProjectMember(input) {
  const member = normalizeProjectMemberInput(input);

  validateProjectMember(member);

  const project = findProjectById(member.projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const employee = findEmployeeById(member.employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (employee.employment_status === "terminated") {
    throw new Error("A terminated employee cannot be added to a project.");
  }

  const existingMembership = findActiveProjectMembership(
    member.projectId,
    member.employeeId,
  );

  if (existingMembership) {
    throw new Error(
      "This employee is already an active member of this project.",
    );
  }

  return createProjectMember(member);
}

function updateExistingProjectMember(id, input) {
  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    throw new Error("Invalid project member ID.");
  }

  const existingMember = findProjectMemberById(memberId);

  if (!existingMember) {
    throw new Error("Project member not found.");
  }

  const member = normalizeProjectMemberInput(input);

  validateProjectMember(member);

  const project = findProjectById(member.projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const employee = findEmployeeById(member.employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (employee.employment_status === "terminated") {
    throw new Error("A terminated employee cannot be assigned to a project.");
  }

  const existingMembership = findActiveProjectMembership(
    member.projectId,
    member.employeeId,
  );

  if (existingMembership && Number(existingMembership.id) !== memberId) {
    throw new Error(
      "This employee is already an active member of this project.",
    );
  }

  return updateProjectMember(memberId, member);
}

function removeExistingProjectMember(id) {
  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    throw new Error("Invalid project member ID.");
  }

  const existingMember = findProjectMemberById(memberId);

  if (!existingMember) {
    throw new Error("Project member not found.");
  }

  if (existingMember.left_at) {
    return existingMember;
  }

  const leftAt = new Date().toISOString().slice(0, 10);

  return removeProjectMember(memberId, leftAt);
}

module.exports = {
  listProjectMembers,
  getProjectMemberById,
  createNewProjectMember,
  updateExistingProjectMember,
  removeExistingProjectMember,
};
