import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';
import ProtectedApp from './ProtectedApp';

function App() {
  const [authState, setAuthState] = useState({
    status: 'checking',
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const session = await window.desktop.auth.getSession();

        if (!isMounted) return;

        if (session.authenticated) {
          setAuthState({
            status: 'authenticated',
            user: session.user,
          });
        } else {
          setAuthState({
            status: 'unauthenticated',
            user: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore authentication session:', error);

        if (!isMounted) return;

        setAuthState({
          status: 'unauthenticated',
          user: null,
        });
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogin(user) {
    setAuthState({
      status: 'authenticated',
      user,
    });
  }

  async function refreshSessionUser() {
    try {
      const session = await window.desktop.auth.getSession();

      if (session.authenticated) {
        setAuthState({
          status: 'authenticated',
          user: session.user,
        });
      }
    } catch (error) {
      console.error('Failed to refresh authentication session:', error);
    }
  }

  async function handleLogout() {
    try {
      await window.desktop.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthState({
        status: 'unauthenticated',
        user: null,
      });
    }
  }

  if (authState.status === 'checking') {
    return (
      <main className="auth-loading">
        <p>Checking authentication…</p>
      </main>
    );
  }

  if (authState.status === 'unauthenticated') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ProtectedApp
      user={authState.user}
      onLogout={handleLogout}
      onUserRefresh={refreshSessionUser}
    />
  );
}

export default App;