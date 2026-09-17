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

module.exports = {
  setCurrentUser,
  getCurrentUser,
  isAuthenticated,
  clearCurrentUser,
};