const { getDatabase } = require("./connection");

function findProjects({ search = "", status = "all", clientId = null } = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        p.project_code LIKE $search
        OR p.name LIKE $search
        OR c.name LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (status !== "all") {
    conditions.push("p.status = $status");
    parameters.status = status;
  }

  if (clientId !== null && clientId !== undefined) {
    conditions.push("p.client_id = $clientId");
    parameters.clientId = clientId;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return database
    .prepare(
      `
      SELECT
        p.id,

        p.client_id,
        c.name AS client_name,

        p.proposal_id,

        p.project_manager_employee_id,
        CASE
          WHEN e.id IS NOT NULL
          THEN e.first_name || ' ' || e.last_name
          ELSE NULL
        END AS project_manager_name,

        p.project_code,
        p.name,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.budget_minor,
        p.contract_value_minor,
        p.currency_code,

        p.created_at,
        p.updated_at

      FROM projects p

      INNER JOIN clients c
        ON c.id = p.client_id

      LEFT JOIN employees e
        ON e.id = p.project_manager_employee_id

      ${whereClause}

      ORDER BY p.created_at DESC
    `,
    )
    .all(parameters);
}

function findProjectById(id) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        p.id,

        p.client_id,
        c.name AS client_name,

        p.proposal_id,

        p.project_manager_employee_id,
        CASE
          WHEN e.id IS NOT NULL
          THEN e.first_name || ' ' || e.last_name
          ELSE NULL
        END AS project_manager_name,

        p.project_code,
        p.name,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.budget_minor,
        p.contract_value_minor,
        p.currency_code,

        p.created_at,
        p.updated_at

      FROM projects p

      INNER JOIN clients c
        ON c.id = p.client_id

      LEFT JOIN employees e
        ON e.id = p.project_manager_employee_id

      WHERE p.id = ?

      LIMIT 1
    `,
    )
    .get(id);
}

function findProjectByCode(projectCode) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        id,
        client_id,
        proposal_id,
        project_manager_employee_id,
        project_code,
        name,
        description,
        status,
        start_date,
        end_date,
        budget_minor,
        contract_value_minor,
        currency_code,
        created_at,
        updated_at
      FROM projects
      WHERE project_code = ?
      LIMIT 1
    `,
    )
    .get(projectCode.trim());
}

function createProject(project) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO projects (
        client_id,
        proposal_id,
        project_manager_employee_id,
        project_code,
        name,
        description,
        status,
        start_date,
        end_date,
        budget_minor,
        contract_value_minor,
        currency_code
      )
      VALUES (
        @clientId,
        @proposalId,
        @projectManagerEmployeeId,
        @projectCode,
        @name,
        @description,
        @status,
        @startDate,
        @endDate,
        @budgetMinor,
        @contractValueMinor,
        @currencyCode
      )
    `,
    )
    .run({
      clientId: project.clientId,
      proposalId: project.proposalId,
      projectManagerEmployeeId: project.projectManagerEmployeeId,
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budgetMinor: project.budgetMinor,
      contractValueMinor: project.contractValueMinor,
      currencyCode: project.currencyCode,
    });

  return findProjectById(Number(result.lastInsertRowid));
}

function updateProject(id, project) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE projects
      SET
        client_id = @clientId,
        proposal_id = @proposalId,
        project_manager_employee_id = @projectManagerEmployeeId,
        project_code = @projectCode,
        name = @name,
        description = @description,
        status = @status,
        start_date = @startDate,
        end_date = @endDate,
        budget_minor = @budgetMinor,
        contract_value_minor = @contractValueMinor,
        currency_code = @currencyCode,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      clientId: project.clientId,
      proposalId: project.proposalId,
      projectManagerEmployeeId: project.projectManagerEmployeeId,
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budgetMinor: project.budgetMinor,
      contractValueMinor: project.contractValueMinor,
      currencyCode: project.currencyCode,
    });

  return findProjectById(id);
}

function updateProjectStatus(id, status) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE projects
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(status, id);

  return findProjectById(id);
}

module.exports = {
  findProjects,
  findProjectById,
  findProjectByCode,
  createProject,
  updateProject,
  updateProjectStatus,
};
