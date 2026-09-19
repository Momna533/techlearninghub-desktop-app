import { useState } from "react";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupScreen({ onLogin }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();

    if (!firstName) {
      setError("First name is required.");
      return;
    }

    if (!lastName) {
      setError("Last name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await window.desktop.auth.signup({
        firstName,
        lastName,
        email,
        password: form.password,
      });

      if (!result?.success) {
        setError(result?.message || "Unable to create account.");
        return;
      }

      setForm(EMPTY_FORM);

      onLogin();
    } catch (signupError) {
      console.error("Signup failed:", signupError);

      setError(
        signupError?.message || "Unable to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Tech Learning Hub</p>

          <h1>Create account</h1>

          <p>
            Create your Tech Learning Hub account to access the Software House +
            Training Academy Management System.
          </p>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="firstName">First name</label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            placeholder="First name"
            disabled={loading}
            required
          />

          <label htmlFor="lastName">Last name</label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            placeholder="Last name"
            disabled={loading}
            required
          />

          <label htmlFor="signup-email">Email</label>

          <input
            id="signup-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading}
            required
          />

          <label htmlFor="signup-password">Password</label>

          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={loading}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={loading}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            disabled={loading}
            className="font-medium text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}
