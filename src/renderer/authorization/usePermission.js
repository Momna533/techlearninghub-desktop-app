import { useMemo } from 'react';
import { userHasAnyPermission, userHasPermission } from './permissions';

export function usePermission(user) {
  return useMemo(() => ({
    can: (permissionCode) => userHasPermission(user, permissionCode),
    canAny: (permissionCodes) => userHasAnyPermission(user, permissionCodes),
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
  }), [user]);
}
