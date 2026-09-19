import { useState } from "react";

const isDevelopment = import.meta.env.DEV;

export default function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await window.desktop.auth.login({
        email: normalizedEmail,
        password,
      });

      if (!result?.success) {
        setErrorMessage(result?.message || "Invalid email or password.");
        return;
      }

      if (!result.user) {
        setErrorMessage("Login completed, but no user session was returned.");
        return;
      }

      onLogin(result.user);
    } catch (error) {
      console.error("Login failed:", error);

      setErrorMessage(
        error?.message || "Unable to complete login. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Tech Learning Hub</p>

          <h1>Welcome back</h1>

          <p>
            Sign in to access the Software House + Training Academy Management
            System.
          </p>
        </div>

        {errorMessage && (
          <p className="auth-error" role="alert">
            {errorMessage}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="username"
            placeholder="you@example.com"
            disabled={isSubmitting}
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isSubmitting}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignup}
            disabled={isSubmitting}
            className="font-medium text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign up
          </button>
        </div>

        {isDevelopment && (
          <p className="auth-hint">
            Fresh databases bootstrap demo accounts:{" "}
            <code>superadmin@techlearninghub.local</code> /{" "}
            <code>SuperAdmin123!</code>
            {", "}
            <code>developer@techlearninghub.local</code> /{" "}
            <code>Developer123!</code>
            {", "}
            <code>hr@techlearninghub.local</code> / <code>HrUser123!</code>.
          </p>
        )}
      </section>
    </main>
  );
}
