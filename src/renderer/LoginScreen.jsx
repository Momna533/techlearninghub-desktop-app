import { useState } from 'react';

const isDevelopment = import.meta.env.DEV;

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await window.desktop.auth.login({
        email,
        password,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onLogin(result.user);
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(
        'Unable to complete login. Please check the application logs.',
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
            Sign in to access the Software House + Training Academy
            Management System.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="you@example.com"
            disabled={isSubmitting}
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isSubmitting}
            required
          />

          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      {isDevelopment && (
  <p className="auth-hint">
    Fresh databases bootstrap demo accounts:
    {' '}
    <code>superadmin@techlearninghub.local</code> /
    {' '}
    <code>SuperAdmin123!</code>,
    {' '}
    <code>developer@techlearninghub.local</code> /
    {' '}
    <code>Developer123!</code>,
    {' '}
    <code>hr@techlearninghub.local</code> /
    {' '}
    <code>HrUser123!</code>.
  </p>
)}
      </section>
    </main>
  );
}

export default LoginScreen;