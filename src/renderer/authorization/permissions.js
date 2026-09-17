import { PERMISSIONS } from "../../domain/authorization/permission-codes";

export { PERMISSIONS };

export function userHasPermission(user, permissionCode) {
  if (!user || !permissionCode) return false;

  return Array.isArray(user.permissions)
    && user.permissions.includes(permissionCode);
}

export function userHasAnyPermission(user, permissionCodes) {
  if (!user || !Array.isArray(permissionCodes)) return false;

  return permissionCodes.some((code) => userHasPermission(user, code));
}