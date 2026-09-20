import { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import AppRoutes from "./routing/AppRoutes";
import StartupLoader from "./components/StartupLoader";

function App() {
  const [showSignup, setShowSignup] = useState(false);

  const [authState, setAuthState] = useState({
    status: "checking",
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
       const [session] = await Promise.all([
      window.desktop.auth.getSession(),
      new Promise((resolve) => setTimeout(resolve, 1500))])

        if (!isMounted) return;

        if (session.authenticated) {
          setAuthState({
            status: "authenticated",
            user: session.user,
          });
        } else {
          setAuthState({
            status: "unauthenticated",
            user: null,
          });
        }
      } catch (error) {
        console.error("Failed to restore authentication session:", error);

        if (!isMounted) return;

        setAuthState({
          status: "unauthenticated",
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
    setShowSignup(false);

    setAuthState({
      status: "authenticated",
      user,
    });
  }

  async function handleLogout() {
    try {
      await window.desktop.auth.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthState({
        status: "unauthenticated",
        user: null,
      });

      setShowSignup(false);
    }
  }

 if (authState.status === "checking") {
  return <StartupLoader />;
}

  if (authState.status === "unauthenticated") {
    if (showSignup) {
      return <SignupScreen onLogin={() => setShowSignup(false)} />;
    }

    return (
      <LoginScreen onLogin={handleLogin} onSignup={() => setShowSignup(true)} />
    );
  }

  return (
    <HashRouter>
      <AppRoutes user={authState.user} onLogout={handleLogout} />
    </HashRouter>
  );
}

export default App;
