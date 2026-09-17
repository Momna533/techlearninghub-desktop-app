import { useEffect, useState } from 'react';
import Can from './authorization/Can';
import { PERMISSIONS, userHasPermission } from './authorization/permissions';

function ProtectedApp({ user, onLogout, onUserRefresh }) {
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [roles, setRoles] = useState([]);
  const [assignEmail, setAssignEmail] = useState('developer@techlearninghub.local');
  const [assignRoleCode, setAssignRoleCode] = useState('hr');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRoles() {
      if (!userHasPermission(user, PERMISSIONS.RBAC_MANAGE)) {
        if (isMounted) setRoles([]);
        return;
      }

      try {
        const result = await window.desktop.rbac.listRoles();
        if (!isMounted) return;

        if (result.success) {
          setRoles(result.roles);
          if (result.roles.length > 0) {
            setAssignRoleCode((current) => (
              result.roles.some((role) => role.code === current)
                ? current
                : result.roles[0].code
            ));
          }
        }
      } catch (error) {
        console.error('Failed to load roles:', error);
      }
    }

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function runProtectedAction(action, label) {
    setActionMessage('');
    setActionError('');

    try {
      const result = await action();

      if (!result.success) {
        setActionError(`${label}: ${result.message} (${result.code})`);
        return;
      }

      setActionMessage(result.message);
    } catch (error) {
      console.error(label, error);
      setActionError(`${label} failed unexpectedly.`);
    }
  }

  async function handleAssignRole(event) {
    event.preventDefault();
    setActionMessage('');
    setActionError('');
    setIsAssigning(true);

    try {
      const result = await window.desktop.rbac.assignRole({
        email: assignEmail,
        roleCode: assignRoleCode,
      });

      if (!result.success) {
        setActionError(result.message);
        return;
      }

      setActionMessage(
        `Assigned ${result.role.name} to ${result.user.email}.`,
      );

      if (typeof onUserRefresh === 'function') {
        await onUserRefresh();
      }
    } catch (error) {
      console.error('Role assignment failed:', error);
      setActionError('Role assignment failed unexpectedly.');
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <main className="app-shell">
      <p className="eyebrow">Application</p>

      <h1>Tech Learning Hub</h1>

      <p>
        Software House + Training Academy Management System
      </p>

      <section className="status">
        <p>
          Signed in as{' '}
          <strong>
            {user.displayName || user.email}
          </strong>
        </p>

        <p>{user.email}</p>

        <p>
          Roles:{' '}
          {(user.roles ?? []).map((role) => role.name).join(', ') || 'None'}
        </p>

        <p className="permission-list">
          Permissions:{' '}
          {(user.permissions ?? []).join(', ') || 'None'}
        </p>
      </section>

      <section className="rbac-panel">
        <h2>Protected operations</h2>
        <p className="rbac-help">
          Buttons are hidden by frontend permission checks. Security is enforced
          in the Electron main process, not by UI visibility.
        </p>

        <div className="rbac-actions">
          <Can user={user} permission={PERMISSIONS.DEMO_ADMIN_ACTION}>
            <button
              type="button"
              onClick={() => runProtectedAction(
                () => window.desktop.rbac.demoAdminAction(),
                'Admin action',
              )}
            >
              Run admin action
            </button>
          </Can>

          <Can user={user} permission={PERMISSIONS.DEMO_HR_ACTION}>
            <button
              type="button"
              onClick={() => runProtectedAction(
                () => window.desktop.rbac.demoHrAction(),
                'HR action',
              )}
            >
              Run HR action
            </button>
          </Can>

          <Can user={user} permission={PERMISSIONS.DEMO_FINANCE_ACTION}>
            <button
              type="button"
              onClick={() => runProtectedAction(
                () => window.desktop.rbac.demoFinanceAction(),
                'Finance action',
              )}
            >
              Run finance action
            </button>
          </Can>
        </div>

        <div className="rbac-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => runProtectedAction(
              () => window.desktop.rbac.demoAdminAction(),
              'Direct admin action attempt',
            )}
          >
            Attempt admin action directly
          </button>
          <p className="rbac-help">
            Always visible. If you lack <code>demo.admin_action</code>, the main
            process must reject this call.
          </p>
        </div>

        {actionMessage && (
          <p className="rbac-success" role="status">{actionMessage}</p>
        )}

        {actionError && (
          <p className="rbac-error" role="alert">{actionError}</p>
        )}
      </section>

      <Can user={user} permission={PERMISSIONS.RBAC_MANAGE}>
        <section className="rbac-panel">
          <h2>Assign role</h2>
          <form className="rbac-form" onSubmit={handleAssignRole}>
            <label htmlFor="assign-email">User email</label>
            <input
              id="assign-email"
              type="email"
              value={assignEmail}
              onChange={(event) => setAssignEmail(event.target.value)}
              required
              disabled={isAssigning}
            />

            <label htmlFor="assign-role">Role</label>
            <select
              id="assign-role"
              value={assignRoleCode}
              onChange={(event) => setAssignRoleCode(event.target.value)}
              disabled={isAssigning}
            >
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.name}
                </option>
              ))}
            </select>

            <button type="submit" disabled={isAssigning}>
              {isAssigning ? 'Assigning…' : 'Assign role'}
            </button>
          </form>
        </section>
      </Can>

      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}

export default ProtectedApp;
