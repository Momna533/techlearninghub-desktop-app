const { getDatabase } = require('./connection');

function findTeamMembers({ search = '', teamId = 'all' } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        tm.role_in_team LIKE $search
        OR t.team_code LIKE $search
        OR t.name LIKE $search
        OR e.employee_code LIKE $search
        OR e.first_name LIKE $search
        OR e.last_name LIKE $search
        OR TRIM(e.first_name || ' ' || e.last_name) LIKE $search
        OR e.email LIKE $search
        OR e.phone LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (teamId !== 'all') {
    conditions.push('tm.team_id = $teamId');
    parameters.teamId = Number(teamId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return database
    .prepare(`
      SELECT
        tm.id,

        tm.team_id,
        t.team_code,
        t.name AS team_name,

        tm.employee_id,
        e.employee_code,
        TRIM(e.first_name || ' ' || e.last_name) AS employee_name,
        e.email AS employee_email,
        e.phone AS employee_phone,
        e.job_title AS employee_job_title,

        tm.role_in_team,
        tm.joined_at,
        tm.left_at,

        CASE
          WHEN tm.left_at IS NULL THEN 'active'
          ELSE 'inactive'
        END AS membership_status,

        tm.created_at,
        tm.updated_at

      FROM team_members tm

      INNER JOIN teams t
        ON t.id = tm.team_id

      INNER JOIN employees e
        ON e.id = tm.employee_id

      ${whereClause}

      ORDER BY
        tm.left_at IS NOT NULL ASC,
        employee_name ASC
    `)
    .all(parameters);
}

function findTeamMemberById(id) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        tm.id,

        tm.team_id,
        t.team_code,
        t.name AS team_name,

        tm.employee_id,
        e.employee_code,
        TRIM(e.first_name || ' ' || e.last_name) AS employee_name,
        e.email AS employee_email,
        e.phone AS employee_phone,
        e.job_title AS employee_job_title,

        tm.role_in_team,
        tm.joined_at,
        tm.left_at,

        CASE
          WHEN tm.left_at IS NULL THEN 'active'
          ELSE 'inactive'
        END AS membership_status,

        tm.created_at,
        tm.updated_at

      FROM team_members tm

      INNER JOIN teams t
        ON t.id = tm.team_id

      INNER JOIN employees e
        ON e.id = tm.employee_id

      WHERE tm.id = ?

      LIMIT 1
    `)
    .get(id);
}

function findActiveTeamMembership(teamId, employeeId) {
  const database = getDatabase();

  return database
    .prepare(`
      SELECT
        id,
        team_id,
        employee_id,
        role_in_team,
        joined_at,
        left_at,
        created_at,
        updated_at
      FROM team_members
      WHERE team_id = ?
        AND employee_id = ?
        AND left_at IS NULL
      LIMIT 1
    `)
    .get(teamId, employeeId);
}

function createTeamMember(member) {
  const database = getDatabase();

  const result = database
    .prepare(`
      INSERT INTO team_members (
        team_id,
        employee_id,
        role_in_team,
        joined_at,
        left_at
      )
      VALUES (
        @teamId,
        @employeeId,
        @roleInTeam,
        @joinedAt,
        @leftAt
      )
    `)
    .run({
      teamId: member.teamId,
      employeeId: member.employeeId,
      roleInTeam: member.roleInTeam,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
    });

  return findTeamMemberById(Number(result.lastInsertRowid));
}

function updateTeamMember(id, member) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE team_members
      SET
        team_id = @teamId,
        employee_id = @employeeId,
        role_in_team = @roleInTeam,
        joined_at = @joinedAt,
        left_at = @leftAt,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
    .run({
      id,
      teamId: member.teamId,
      employeeId: member.employeeId,
      roleInTeam: member.roleInTeam,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
    });

  return findTeamMemberById(id);
}

function removeTeamMember(id, leftAt) {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE team_members
      SET
        left_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(leftAt, id);

  return findTeamMemberById(id);
}

module.exports = {
  findTeamMembers,
  findTeamMemberById,
  findActiveTeamMembership,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
};