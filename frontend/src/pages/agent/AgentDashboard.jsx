
import { useEffect, useState } from "react";
import "../../styles/agent/AgentDashboard.css";

function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/tickets/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load assigned tickets.");
        }

        const data = await response.json();

        setTickets(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");

    window.location.href = "/";
  }

  return (
    <div className="agent-dashboard">
      <header className="agent-header">
        <div>
          <h1>Agent Dashboard</h1>
          <p>Manage your assigned support requests.</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <section className="agent-stats">
        <div className="agent-stat-card">
          <h3>Total Assigned</h3>
          <h2>{loading ? "..." : tickets.length}</h2>
        </div>

        <div className="agent-stat-card">
          <h3>Open Tickets</h3>
          <h2>{loading ? "..." : openTickets}</h2>
        </div>

        <div className="agent-stat-card">
          <h3>In Progress</h3>
          <h2>{loading ? "..." : inProgressTickets}</h2>
        </div>

        <div className="agent-stat-card">
          <h3>Resolved</h3>
          <h2>{loading ? "..." : resolvedTickets}</h2>
        </div>
      </section>

      <section className="agent-tickets">
        <h2>My Assigned Tickets</h2>

        {loading && <p>Loading assigned tickets...</p>}

        {error && <p className="agent-error">{error}</p>}

        {!loading && !error && tickets.length === 0 && (
          <p>No tickets assigned to you yet.</p>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="agent-ticket-list">
            {tickets.map((ticket) => (
              <div className="agent-ticket-item" key={ticket.id}>
                <div>
                  <h3>{ticket.title}</h3>
                  <p>Ticket #{ticket.id}</p>
                  <p>Priority: {ticket.priority}</p>
                </div>

                <span className="agent-ticket-status">
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AgentDashboard;
