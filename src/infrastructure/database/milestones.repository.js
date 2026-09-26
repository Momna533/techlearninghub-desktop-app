const { getDatabase } = require("./connection");

function findMilestones({
  search = "",
  projectId = "all",
  status = "all",
} = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        m.name LIKE $search
        OR m.description LIKE $search
        OR p.project_code LIKE $search
        OR p.name LIKE $search
        OR c.name LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (projectId !== "all") {
    conditions.push("m.project_id = $projectId");

    parameters.projectId = Number(projectId);
  }

  if (status !== "all") {
    conditions.push("m.status = $status");

    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return database
    .prepare(
      `
      SELECT
        m.id,

        m.project_id,
        p.project_code,
        p.name AS project_name,

        c.id AS client_id,
        c.name AS client_name,

        m.name,
        m.description,
        m.status,
        m.due_date,
        m.completed_at,
        m.amount_minor,
        m.sort_order,

        m.created_at,
        m.updated_at

      FROM milestones m

      INNER JOIN projects p
        ON p.id = m.project_id

      INNER JOIN clients c
        ON c.id = p.client_id

      ${whereClause}

      ORDER BY
        m.project_id ASC,
        m.sort_order ASC,
        m.id ASC
    `,
    )
    .all(parameters);
}

function findMilestoneById(id) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        m.id,

        m.project_id,
        p.project_code,
        p.name AS project_name,

        c.id AS client_id,
        c.name AS client_name,

        m.name,
        m.description,
        m.status,
        m.due_date,
        m.completed_at,
        m.amount_minor,
        m.sort_order,

        m.created_at,
        m.updated_at

      FROM milestones m

      INNER JOIN projects p
        ON p.id = m.project_id

      INNER JOIN clients c
        ON c.id = p.client_id

      WHERE m.id = ?

      LIMIT 1
    `,
    )
    .get(id);
}

function findMilestoneByProjectAndName(projectId, name, excludeId = null) {
  const database = getDatabase();

  if (excludeId !== null) {
    return database
      .prepare(
        `
        SELECT
          id,
          project_id,
          name,
          description,
          status,
          due_date,
          completed_at,
          amount_minor,
          sort_order,
          created_at,
          updated_at
        FROM milestones
        WHERE project_id = ?
          AND LOWER(TRIM(name)) =
              LOWER(TRIM(?))
          AND id != ?
        LIMIT 1
      `,
      )
      .get(projectId, name, excludeId);
  }

  return database
    .prepare(
      `
      SELECT
        id,
        project_id,
        name,
        description,
        status,
        due_date,
        completed_at,
        amount_minor,
        sort_order,
        created_at,
        updated_at
      FROM milestones
      WHERE project_id = ?
        AND LOWER(TRIM(name)) =
            LOWER(TRIM(?))
      LIMIT 1
    `,
    )
    .get(projectId, name);
}

function findMilestoneByProjectAndSortOrder(
  projectId,
  sortOrder,
  excludeId = null,
) {
  const database = getDatabase();

  if (excludeId !== null) {
    return database
      .prepare(
        `
        SELECT
          id,
          project_id,
          name,
          sort_order
        FROM milestones
        WHERE project_id = ?
          AND sort_order = ?
          AND id != ?
        LIMIT 1
      `,
      )
      .get(projectId, sortOrder, excludeId);
  }

  return database
    .prepare(
      `
      SELECT
        id,
        project_id,
        name,
        sort_order
      FROM milestones
      WHERE project_id = ?
        AND sort_order = ?
      LIMIT 1
    `,
    )
    .get(projectId, sortOrder);
}

function getNextMilestoneSortOrder(projectId) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      SELECT
        COALESCE(
          MAX(sort_order),
          -1
        ) + 1 AS next_sort_order
      FROM milestones
      WHERE project_id = ?
    `,
    )
    .get(projectId);

  return Number(result.next_sort_order);
}

function createMilestone(milestone) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO milestones (
        project_id,
        name,
        description,
        status,
        due_date,
        completed_at,
        amount_minor,
        sort_order
      )
      VALUES (
        @projectId,
        @name,
        @description,
        @status,
        @dueDate,
        @completedAt,
        @amountMinor,
        @sortOrder
      )
    `,
    )
    .run({
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description,
      status: milestone.status,
      dueDate: milestone.dueDate,
      completedAt: milestone.completedAt,
      amountMinor: milestone.amountMinor,
      sortOrder: milestone.sortOrder,
    });

  return findMilestoneById(Number(result.lastInsertRowid));
}

function updateMilestone(id, milestone) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE milestones
      SET
        project_id = @projectId,
        name = @name,
        description = @description,
        status = @status,
        due_date = @dueDate,
        completed_at = @completedAt,
        amount_minor = @amountMinor,
        sort_order = @sortOrder,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description,
      status: milestone.status,
      dueDate: milestone.dueDate,
      completedAt: milestone.completedAt,
      amountMinor: milestone.amountMinor,
      sortOrder: milestone.sortOrder,
    });

  return findMilestoneById(id);
}

function updateMilestoneStatus(id, status, completedAt) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE milestones
      SET
        status = ?,
        completed_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(status, completedAt, id);

  return findMilestoneById(id);
}

module.exports = {
  findMilestones,
  findMilestoneById,
  findMilestoneByProjectAndName,
  findMilestoneByProjectAndSortOrder,
  getNextMilestoneSortOrder,
  createMilestone,
  updateMilestone,
  updateMilestoneStatus,
};
