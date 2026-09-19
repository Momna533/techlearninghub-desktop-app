const { PERMISSIONS } = require("../../domain/authorization/permission-codes");
const { requirePermission } = require("./authorization.service");

const bcrypt = require("bcryptjs");
const { getDatabase } = require("../../infrastructure/database/connection");

const {
  getRoleByCode,
  assignRole,
} = require("../../infrastructure/database/repositories/rbac.repository");

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    status: user.status,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function findUserByEmail(email) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        id,
        email,
        password_hash,
        display_name,
        status,
        last_login_at,
        disabled_at,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
      COLLATE NOCASE
      LIMIT 1
    `,
    )
    .get(email.trim());
}

async function authenticateUser({ email, password }) {
  if (typeof email !== "string" || !email.trim()) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Email is required.",
    };
  }

  if (typeof password !== "string" || !password) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Password is required.",
    };
  }

  const user = findUserByEmail(email);

  console.log("LOGIN DEBUG:", {
    enteredEmail: email.trim(),
    userFound: Boolean(user),
    userId: user?.id,
    storedEmail: user?.email,
    hasPasswordHash: Boolean(user?.password_hash),
  });

  if (!user) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  if (user.status !== "active") {
    return {
      success: false,
      code: "ACCOUNT_DISABLED",
      message: "This account is disabled.",
    };
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE users
      SET
        last_login_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(user.id);

  const updatedUser = database
    .prepare(
      `
      SELECT
        id,
        email,
        password_hash,
        display_name,
        status,
        last_login_at,
        disabled_at,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(user.id);

  return {
    success: true,
    user: sanitizeUser(updatedUser),
  };
}

async function createUser({
  email,
  password,
  displayName = null,
  skipAuthorizationCheck = false,
}) {
  if (!skipAuthorizationCheck) {
    const denial = requirePermission(PERMISSIONS.USERS_MANAGE);

    if (denial) {
      return denial;
    }
  }

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const database = getDatabase();

  const existingUser = database
    .prepare(
      `
      SELECT id
      FROM users
      WHERE email = ?
      COLLATE NOCASE
      LIMIT 1
    `,
    )
    .get(normalizedEmail);

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = database
    .prepare(
      `
      INSERT INTO users (
        email,
        password_hash,
        display_name,
        status
      )
      VALUES (?, ?, ?, 'active')
    `,
    )
    .run(normalizedEmail, passwordHash, displayName);

  return {
    id: Number(result.lastInsertRowid),
    email: normalizedEmail,
    displayName,
  };
}

async function registerUser({ firstName, lastName, email, password }) {
  const normalizedFirstName = firstName?.trim();
  const normalizedLastName = lastName?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedFirstName) {
    return {
      success: false,
      message: "First name is required.",
    };
  }

  if (!normalizedLastName) {
    return {
      success: false,
      message: "Last name is required.",
    };
  }

  if (!normalizedEmail) {
    return {
      success: false,
      message: "Email is required.",
    };
  }

  if (!password) {
    return {
      success: false,
      message: "Password is required.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters.",
    };
  }

  const existingUser = findUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  const displayName = `${normalizedFirstName} ${normalizedLastName}`.trim();

  const user = await createUser({
    email: normalizedEmail,
    password,
    displayName,
    skipAuthorizationCheck: true,
  });

  const adminRole = getRoleByCode("admin");

  if (!adminRole) {
    throw new Error(
      "Admin role is not configured. Please initialize the Admin role first.",
    );
  }

  assignRole(user.id, adminRole.id);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: "active",
    },
  };
}

module.exports = {
  authenticateUser,
  createUser,
  registerUser,
};
