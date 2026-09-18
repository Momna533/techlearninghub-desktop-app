/**
 * Canonical permission codes.
 * Backend authorization and frontend visibility both reference these constants.
 * Module-specific permissions can be added here later without changing the check machinery.
 */
const catalog = require('./permission-catalog.json');

const PERMISSIONS = Object.freeze({ ...catalog.permissions });
const PERMISSION_DEFINITIONS = Object.freeze(catalog.definitions.map((entry) => (
  Object.freeze({ ...entry })
)));

module.exports = {
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
};
