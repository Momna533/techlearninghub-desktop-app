import { userHasPermission } from './permissions';
import UnauthorizedPage from '../pages/UnauthorizedPage';

/**
 * Route guard for module pages. Visibility-only helper — real security for
 * mutations remains in the Electron main process.
 */
function RequirePermission({ user, permission, children }) {
  if (!permission) {
    return children;
  }

  if (!userHasPermission(user, permission)) {
    return <UnauthorizedPage />;
  }

  return children;
}

export default RequirePermission;
