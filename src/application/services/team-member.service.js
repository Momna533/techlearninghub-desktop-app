const {
  findTeamMembers,
  findTeamMemberById,
  findActiveTeamMembership,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
} = require('../../infrastructure/database/team-member.repository');

const {
  findEmployeeById,
} = require('../../infrastructure/database/employee.repository');

const {
  findTeamById,
} = require('../../infrastructure/database/team.repository');

function normalizeTeamMemberInput(member = {}) {
  return {
    teamId:
      member.teamId === '' ||
      member.teamId === null ||
      member.teamId === undefined
        ? null
        : Number(member.teamId),

    employeeId:
      member.employeeId === '' ||
      member.employeeId === null ||
      member.employeeId === undefined
        ? null
        : Number(member.employeeId),

    roleInTeam: String(member.roleInTeam ?? '').trim(),

    joinedAt: String(member.joinedAt ?? '').trim(),

    leftAt:
      String(member.leftAt ?? '').trim() || null,
  };
}

function validateTeamMember(member) {
  if (
    !Number.isInteger(member.teamId) ||
    member.teamId <= 0
  ) {
    throw new Error('A valid team is required.');
  }

  if (
    !Number.isInteger(member.employeeId) ||
    member.employeeId <= 0
  ) {
    throw new Error('A valid employee is required.');
  }

  if (!member.roleInTeam) {
    throw new Error('Role in team is required.');
  }

  if (!member.joinedAt) {
    throw new Error('Joined date is required.');
  }

  if (
    member.leftAt &&
    member.leftAt < member.joinedAt
  ) {
    throw new Error(
      'Left date cannot be before joined date.',
    );
  }
}

function listTeamMembers({
  search = '',
  teamId = 'all',
} = {}) {
  if (
    teamId !== 'all' &&
    (!Number.isInteger(Number(teamId)) ||
      Number(teamId) <= 0)
  ) {
    throw new Error('Invalid team filter.');
  }

  return findTeamMembers({
    search: String(search ?? ''),
    teamId,
  });
}

function getTeamMemberById(id) {
  const memberId = Number(id);

  if (
    !Number.isInteger(memberId) ||
    memberId <= 0
  ) {
    throw new Error('Invalid team member ID.');
  }

  const member = findTeamMemberById(memberId);

  if (!member) {
    throw new Error('Team member not found.');
  }

  return member;
}

function createNewTeamMember(input) {
  const member = normalizeTeamMemberInput(input);

  validateTeamMember(member);

  const team = findTeamById(member.teamId);

  if (!team) {
    throw new Error('Team not found.');
  }

  const employee = findEmployeeById(member.employeeId);

  if (!employee) {
    throw new Error('Employee not found.');
  }

  if (employee.employment_status === 'terminated') {
    throw new Error(
      'A terminated employee cannot be added to a team.',
    );
  }

  const existingMembership = findActiveTeamMembership(
    member.teamId,
    member.employeeId,
  );

  if (existingMembership) {
    throw new Error(
      'This employee is already an active member of this team.',
    );
  }

  return createTeamMember(member);
}

function updateExistingTeamMember(id, input) {
  const memberId = Number(id);

  if (
    !Number.isInteger(memberId) ||
    memberId <= 0
  ) {
    throw new Error('Invalid team member ID.');
  }

  const existingMember = findTeamMemberById(memberId);

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  const member = normalizeTeamMemberInput(input);

  validateTeamMember(member);

  const team = findTeamById(member.teamId);

  if (!team) {
    throw new Error('Team not found.');
  }

  const employee = findEmployeeById(member.employeeId);

  if (!employee) {
    throw new Error('Employee not found.');
  }

  if (employee.employment_status === 'terminated') {
    throw new Error(
      'A terminated employee cannot be assigned to a team.',
    );
  }

  const existingMembership = findActiveTeamMembership(
    member.teamId,
    member.employeeId,
  );

  if (
    existingMembership &&
    Number(existingMembership.id) !== memberId
  ) {
    throw new Error(
      'This employee is already an active member of this team.',
    );
  }

  return updateTeamMember(memberId, member);
}

function removeExistingTeamMember(id) {
  const memberId = Number(id);

  if (
    !Number.isInteger(memberId) ||
    memberId <= 0
  ) {
    throw new Error('Invalid team member ID.');
  }

  const existingMember = findTeamMemberById(memberId);

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  if (existingMember.left_at) {
    return existingMember;
  }

  const leftAt = new Date()
    .toISOString()
    .slice(0, 10);

  return removeTeamMember(memberId, leftAt);
}

module.exports = {
  listTeamMembers,
  getTeamMemberById,
  createNewTeamMember,
  updateExistingTeamMember,
  removeExistingTeamMember,
};