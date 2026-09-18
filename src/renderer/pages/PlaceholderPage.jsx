/**
 * Shared placeholder for modules that are not implemented yet.
 * Replace the route element (or this page file) with a real module later;
 * keep the path and permission from nav-config unchanged.
 */
function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <h2>{title}</h2>
      <p className="placeholder-lead">
        {description || 'This module is not implemented yet.'}
      </p>
      <p className="placeholder-note">
        Placeholder page — business functionality will be added in a later
        module without changing the shell route or navigation entry.
      </p>
    </section>
  );
}

export default PlaceholderPage;
