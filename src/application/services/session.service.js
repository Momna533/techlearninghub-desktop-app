let currentUser = null;

function setCurrentUser(user) {
  currentUser = user
    ? {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: Array.isArray(user.roles) ? user.roles : [],
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      }
    : null;

  return currentUser;
}

function getCurrentUser() {
  return currentUser;
}

function isAuthenticated() {
  return currentUser !== null;
}

function clearCurrentUser() {
  currentUser = null;
}

function getSessionPermissions() {
  return currentUser?.permissions ?? [];
}

module.exports = {
  setCurrentUser,
  getCurrentUser,
  isAuthenticated,
  clearCurrentUser,
  getSessionPermissions,
};
