
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AI Support</h2>
        <p className="active">Dashboard</p>
        <p>My Tickets</p>
        <p>AI Chat</p>
        <p>Profile</p>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Welcome to your support workspace.</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total Tickets</p>
            <h2>--</h2>
          </div>

          <div className="stat-card">
            <p>Open Tickets</p>
            <h2>--</h2>
          </div>

          <div className="stat-card">
            <p>Resolved Tickets</p>
            <h2>--</h2>
          </div>
        </section>

        <section className="tickets-panel">
          <h2>My Recent Tickets</h2>
          <p>Your ticket information will appear here.</p>

          <button onClick={() => alert("Ticket creation is our next step!")}>
            + Create New Ticket
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
