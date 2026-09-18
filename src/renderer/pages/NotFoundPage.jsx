import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="placeholder-page">
      <h2>Page not found</h2>
      <p className="placeholder-lead">
        The page you requested is not part of the application shell.
      </p>
      <Link className="text-link" to="/">
        Back to dashboard
      </Link>
    </section>
  );
}

export default NotFoundPage;
