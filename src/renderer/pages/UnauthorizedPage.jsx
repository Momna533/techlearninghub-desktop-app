import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <section className="placeholder-page unauthorized-page">
      <h2>Access denied</h2>
      <p className="placeholder-lead">
        You do not have permission to open this page.
      </p>
      <p className="placeholder-note">
        Ask an administrator to assign the required role if you need access.
      </p>
      <Link className="text-link" to="/">
        Back to dashboard
      </Link>
    </section>
  );
}

export default UnauthorizedPage;
