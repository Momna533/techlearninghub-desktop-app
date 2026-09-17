function ProtectedApp({ user, onLogout }) {
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
      </section>

      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}

export default ProtectedApp;