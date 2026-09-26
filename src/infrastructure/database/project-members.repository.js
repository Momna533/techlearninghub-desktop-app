const { getDatabase } = require("./connection");

function findProjectMembers({ search = "", projectId = "all" } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        pm.role_on_project LIKE $search
        OR p.project_code LIKE $search
        OR p.name LIKE $search
        OR c.name LIKE $search
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

  if (projectId !== "all") {
    conditions.push("pm.project_id = $projectId");
    parameters.projectId = Number(projectId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return database
    .prepare(
      `
      SELECT
        pm.id,

        pm.project_id,
        p.project_code,
        p.name AS project_name,
        c.id AS client_id,
        c.name AS client_name,

        pm.employee_id,
        e.employee_code,
        TRIM(e.first_name || ' ' || e.last_name) AS employee_name,
        e.email AS employee_email,
        e.phone AS employee_phone,
        e.job_title AS employee_job_title,

        pm.role_on_project,
        pm.allocation_percent,
        pm.joined_at,
        pm.left_at,

        CASE
          WHEN pm.left_at IS NULL THEN 'active'
          ELSE 'inactive'
        END AS membership_status,

        pm.created_at,
        pm.updated_at

      FROM project_members pm

      INNER JOIN projects p
        ON p.id = pm.project_id

      INNER JOIN clients c
        ON c.id = p.client_id

      INNER JOIN employees e
        ON e.id = pm.employee_id

      ${whereClause}

      ORDER BY
        pm.left_at IS NOT NULL ASC,
        employee_name ASC
    `,
    )
    .all(parameters);
}

function findProjectMemberById(id) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        pm.id,

        pm.project_id,
        p.project_code,
        p.name AS project_name,
        c.id AS client_id,
        c.name AS client_name,

        pm.employee_id,
        e.employee_code,
        TRIM(e.first_name || ' ' || e.last_name) AS employee_name,
        e.email AS employee_email,
        e.phone AS employee_phone,
        e.job_title AS employee_job_title,

        pm.role_on_project,
        pm.allocation_percent,
        pm.joined_at,
        pm.left_at,

        CASE
          WHEN pm.left_at IS NULL THEN 'active'
          ELSE 'inactive'
        END AS membership_status,

        pm.created_at,
        pm.updated_at

      FROM project_members pm

      INNER JOIN projects p
        ON p.id = pm.project_id

      INNER JOIN clients c
        ON c.id = p.client_id

      INNER JOIN employees e
        ON e.id = pm.employee_id

      WHERE pm.id = ?

      LIMIT 1
    `,
    )
    .get(id);
}

function findActiveProjectMembership(projectId, employeeId) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        id,
        project_id,
        employee_id,
        role_on_project,
        allocation_percent,
        joined_at,
        left_at,
        created_at,
        updated_at
      FROM project_members
      WHERE project_id = ?
        AND employee_id = ?
        AND left_at IS NULL
      LIMIT 1
    `,
    )
    .get(projectId, employeeId);
}

function createProjectMember(member) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO project_members (
        project_id,
        employee_id,
        role_on_project,
        allocation_percent,
        joined_at,
        left_at
      )
      VALUES (
        @projectId,
        @employeeId,
        @roleOnProject,
        @allocationPercent,
        @joinedAt,
        @leftAt
      )
    `,
    )
    .run({
      projectId: member.projectId,
      employeeId: member.employeeId,
      roleOnProject: member.roleOnProject,
      allocationPercent: member.allocationPercent,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
    });

  return findProjectMemberById(Number(result.lastInsertRowid));
}

function updateProjectMember(id, member) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE project_members
      SET
        project_id = @projectId,
        employee_id = @employeeId,
        role_on_project = @roleOnProject,
        allocation_percent = @allocationPercent,
        joined_at = @joinedAt,
        left_at = @leftAt,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      projectId: member.projectId,
      employeeId: member.employeeId,
      roleOnProject: member.roleOnProject,
      allocationPercent: member.allocationPercent,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
    });

  return findProjectMemberById(id);
}

function removeProjectMember(id, leftAt) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE project_members
      SET
        left_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(leftAt, id);

  return findProjectMemberById(id);
}

module.exports = {
  findProjectMembers,
  findProjectMemberById,
  findActiveProjectMembership,
  createProjectMember,
  updateProjectMember,
  removeProjectMember,
};
