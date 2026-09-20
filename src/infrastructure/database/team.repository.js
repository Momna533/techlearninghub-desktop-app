const { getDatabase } = require('./connection');

function findTeams({ search = '', status = 'all' } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        t.team_code LIKE $search
        OR t.name LIKE $search
        OR t.description LIKE $search
        OR TRIM(e.first_name || ' ' || e.last_name) LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (status !== 'all') {
    conditions.push('t.status = $status');
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return database
    .prepare(`
      SELECT
        t.id,
        t.team_code,
        t.name,
        t.lead_employee_id,
        TRIM(e.first_name || ' ' || e.last_name) AS lead_employee_name,
        t.description,
        t.status,
        t.created_at,
        t.updated_at
      FROM teams t
      LEFT JOIN employees e
        ON e.id = t.lead_employee_id
      ${whereClause}
      ORDER BY t.name ASC
    `)
    .all(parameters);
}

function findTeamById(id) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        t.id,
        t.team_code,
        t.name,
        t.lead_employee_id,
        TRIM(e.first_name || ' ' || e.last_name) AS lead_employee_name,
        t.description,
        t.status,
        t.created_at,
        t.updated_at
      FROM teams t
      LEFT JOIN employees e
        ON e.id = t.lead_employee_id
      WHERE t.id = ?
      LIMIT 1
    `)
    .get(id);
}

function findTeamByCode(teamCode) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        id,
        team_code,
        name,
        lead_employee_id,
        description,
        status,
        created_at,
        updated_at
      FROM teams
      WHERE team_code = ?
      LIMIT 1
    `)
    .get(teamCode.trim());
}

function createTeam(team) {
  const database = getDatabase();

  const result = database
    .prepare(`
      INSERT INTO teams (
        team_code,
        name,
        lead_employee_id,
        description,
        status
      )
      VALUES (
        @teamCode,
        @name,
        @leadEmployeeId,
        @description,
        @status
      )
    `)
    .run({
      teamCode: team.teamCode,
      name: team.name,
      leadEmployeeId: team.leadEmployeeId,
      description: team.description,
      status: team.status,
    });

  return findTeamById(Number(result.lastInsertRowid));
}

function updateTeam(id, team) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE teams
      SET
        team_code = @teamCode,
        name = @name,
        lead_employee_id = @leadEmployeeId,
        description = @description,
        status = @status,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
    .run({
      id,
      teamCode: team.teamCode,
      name: team.name,
      leadEmployeeId: team.leadEmployeeId,
      description: team.description,
      status: team.status,
    });

  return findTeamById(id);
}

function deactivateTeam(id) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE teams
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  return findTeamById(id);
}

function archiveTeam(id) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE teams
      SET
        status = 'archived',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  return findTeamById(id);
}

module.exports = {
  findTeams,
  findTeamById,
  findTeamByCode,
  createTeam,
  updateTeam,
  deactivateTeam,
  archiveTeam,
};