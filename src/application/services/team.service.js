const {
  findTeams,
  findTeamById,
  findTeamByCode,
  createTeam,
  updateTeam,
  deactivateTeam,
  archiveTeam,
} = require('../../infrastructure/database/team.repository');

const TEAM_STATUSES = ['active', 'inactive', 'archived'];

function normalizeTeamInput(team = {}) {
  return {
    teamCode: String(team.teamCode ?? '').trim(),
    name: String(team.name ?? '').trim(),
    leadEmployeeId:
      team.leadEmployeeId === '' ||
      team.leadEmployeeId === null ||
      team.leadEmployeeId === undefined
        ? null
        : Number(team.leadEmployeeId),
    description: String(team.description ?? '').trim(),
    status: String(team.status ?? 'active').trim(),
  };
}

function validateTeam(team) {
  if (!team.teamCode) {
    throw new Error('Team code is required.');
  }

  if (!team.name) {
    throw new Error('Team name is required.');
  }

  if (!TEAM_STATUSES.includes(team.status)) {
    throw new Error('Invalid team status.');
  }

  if (
    team.leadEmployeeId !== null &&
    (!Number.isInteger(team.leadEmployeeId) || team.leadEmployeeId <= 0)
  ) {
    throw new Error('Invalid team lead.');
  }
}

function listTeams({ search = '', status = 'all' } = {}) {
  if (!['all', ...TEAM_STATUSES].includes(status)) {
    throw new Error('Invalid team status filter.');
  }

  return findTeams({
    search: String(search ?? ''),
    status,
  });
}

function getTeamById(id) {
  const teamId = Number(id);

  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error('Invalid team ID.');
  }

  const team = findTeamById(teamId);

  if (!team) {
    throw new Error('Team not found.');
  }

  return team;
}

function createNewTeam(input) {
  const team = normalizeTeamInput(input);

  validateTeam(team);

  const existingTeam = findTeamByCode(team.teamCode);

  if (existingTeam) {
    throw new Error('A team with this team code already exists.');
  }

  return createTeam(team);
}

function updateExistingTeam(id, input) {
  const teamId = Number(id);

  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error('Invalid team ID.');
  }

  const existingTeam = findTeamById(teamId);

  if (!existingTeam) {
    throw new Error('Team not found.');
  }

  const team = normalizeTeamInput(input);

  validateTeam(team);

  const teamWithSameCode = findTeamByCode(team.teamCode);

  if (
    teamWithSameCode &&
    Number(teamWithSameCode.id) !== teamId
  ) {
    throw new Error('A team with this team code already exists.');
  }

  return updateTeam(teamId, team);
}

function deactivateExistingTeam(id) {
  const teamId = Number(id);

  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error('Invalid team ID.');
  }

  const existingTeam = findTeamById(teamId);

  if (!existingTeam) {
    throw new Error('Team not found.');
  }

  if (existingTeam.status === 'inactive') {
    return existingTeam;
  }

  return deactivateTeam(teamId);
}

function archiveExistingTeam(id) {
  const teamId = Number(id);

  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error('Invalid team ID.');
  }

  const existingTeam = findTeamById(teamId);

  if (!existingTeam) {
    throw new Error('Team not found.');
  }

  if (existingTeam.status === 'archived') {
    return existingTeam;
  }

  return archiveTeam(teamId);
}

module.exports = {
  listTeams,
  getTeamById,
  createNewTeam,
  updateExistingTeam,
  deactivateExistingTeam,
  archiveExistingTeam,
};