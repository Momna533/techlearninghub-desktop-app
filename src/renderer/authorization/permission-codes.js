/**
 * Renderer-facing permission constants.
 * Sourced from the shared domain catalog so Vite never imports CommonJS directly.
 */
import catalog from '../../domain/authorization/permission-catalog.json';

export const PERMISSIONS = Object.freeze({ ...catalog.permissions });
export const PERMISSION_DEFINITIONS = Object.freeze(
  catalog.definitions.map((entry) => Object.freeze({ ...entry })),
);
