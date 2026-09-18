import { useEffect, useState } from 'react';
import { HashRouter } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import AppRoutes from './routing/AppRoutes';

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
    <HashRouter>
      <AppRoutes user={authState.user} onLogout={handleLogout} />
    </HashRouter>
  );
}

export default App;
