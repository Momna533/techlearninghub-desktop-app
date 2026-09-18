function DashboardPage({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}

export default DashboardPage;