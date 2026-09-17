import { userHasPermission } from './permissions';

/**
 * Frontend visibility helper only. Never treat this as a security boundary.
 * Backend/main-process requirePermission remains authoritative.
 */
function Can({ user, permission, children, fallback = null }) {
  if (!userHasPermission(user, permission)) {
    return fallback;
  }

  return children;
}

export default Can;
