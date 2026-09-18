import { PERMISSIONS } from './permission-codes';

export { PERMISSIONS };

export function userHasPermission(user, permissionCode) {
  if (!user || !permissionCode) return false;

  return Array.isArray(user.permissions)
    && user.permissions.includes(permissionCode);
}

export function userHasAnyPermission(user, permissionCodesList) {
  if (!user || !Array.isArray(permissionCodesList)) return false;

  return permissionCodesList.some((code) => userHasPermission(user, code));
}
