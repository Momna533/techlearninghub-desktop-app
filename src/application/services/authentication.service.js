const bcrypt = require('bcryptjs');
const { getDatabase } = require('../../infrastructure/database/connection');

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
    .prepare(`
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
    `)
    .get(email.trim());
}

async function authenticateUser({ email, password }) {
  if (typeof email !== 'string' || !email.trim()) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Email is required.',
    };
  }

  if (typeof password !== 'string' || !password) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Password is required.',
    };
  }

  const user = findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    };
  }

  if (user.status !== 'active') {
    return {
      success: false,
      code: 'ACCOUNT_DISABLED',
      message: 'This account is disabled.',
    };
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!passwordMatches) {
    return {
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    };
  }

  const database = getDatabase();

  database
    .prepare(`
      UPDATE users
      SET
        last_login_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(user.id);

  const updatedUser = database
    .prepare(`
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
    `)
    .get(user.id);

  return {
    success: true,
    user: sanitizeUser(updatedUser),
  };
}

async function createUser({ email, password, displayName = null }) {
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required.');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must contain at least 8 characters.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const database = getDatabase();

  const existingUser = database
    .prepare(`
      SELECT id
      FROM users
      WHERE email = ?
      COLLATE NOCASE
      LIMIT 1
    `)
    .get(normalizedEmail);

  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = database
    .prepare(`
      INSERT INTO users (
        email,
        password_hash,
        display_name,
        status
      )
      VALUES (?, ?, ?, 'active')
    `)
    .run(
      normalizedEmail,
      passwordHash,
      displayName,
    );

  return {
    id: Number(result.lastInsertRowid),
    email: normalizedEmail,
    displayName,
  };
}

module.exports = {
  authenticateUser,
  createUser,
};