
import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/tickets/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/";
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load tickets.");
        }

        const data = await response.json();

        // Supports either a regular array or paginated results.
        setTickets(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Unable to connect to Django.");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;

  
  async function handleCreateTicket(event) {
    event.preventDefault();

    setSaving(true);
    setCreateError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/tickets/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTitle.trim(),
            description: newDescription.trim(),
            priority: newPriority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.title?.[0] ||
          data.description?.[0] ||
          JSON.stringify(data)
        );
        }

      // Add the newly created ticket to the dashboard.
      setTickets((previousTickets) => [...previousTickets, data]);

      setNewTitle("");
      setNewDescription("");
      setNewPriority("MEDIUM");
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.message || "Could not create ticket.");
    } finally {
      setSaving(false);
    }
  }
 
  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/";
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AI Support</h2>
        <button
  className="sidebar-link active"
  onClick={() => window.location.href = "/dashboard"}
>
  Dashboard
</button>

<button
  className="sidebar-link"
  onClick={() => window.location.href = "/my-tickets"}
>
  My Tickets
</button>

<button
  className="sidebar-link"
  onClick={() => window.location.href = "/ai-chat"}
>
  AI Chat
</button>

<button
  className="sidebar-link"
  onClick={() => window.location.href = "/profile"}
>
  Profile
</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Welcome to your support workspace.</p>
          </div>

          <button onClick={logout}>Logout</button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total Tickets</p>
            <h2>{loading ? "..." : tickets.length}</h2>
          </div>

          <div className="stat-card">
            <p>Open Tickets</p>
            <h2>{loading ? "..." : openTickets}</h2>
          </div>

          <div className="stat-card">
            <p>Resolved Tickets</p>
            <h2>{loading ? "..." : resolvedTickets}</h2>
          </div>
        </section>

        <section className="tickets-panel">
          <h2>My Recent Tickets</h2>

          {loading && <p>Loading tickets...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && tickets.length === 0 && (
            <p>You have not created any tickets yet.</p>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div className="ticket-list">
              {tickets.slice(0, 5).map((ticket) => (
                <div className="ticket-item" key={ticket.id}>
                  <div>
                    <strong>{ticket.title}</strong>
                    <p>Ticket #{ticket.id}</p>
                  </div>

                  <span className="ticket-status">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => {
            setCreateError("");
            setShowCreateForm((previous) => !previous);
            }}>
            {showCreateForm ? "Cancel" : "+ Create New Ticket"}
          </button>
            {showCreateForm && (
          <form className="create-ticket-form" onSubmit={handleCreateTicket}>
              <h3>Create a Support Ticket</h3>

              <label htmlFor="ticket-title">Ticket Title</label>
              <input
                  id="ticket-title"
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Example: Cannot log in"
                  required
              />

              <label htmlFor="ticket-description">Description</label>
              <textarea
                id="ticket-description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Explain your problem..."
                rows={4}
                required
              />

              <label htmlFor="ticket-priority">Priority</label>
              <select
                id="ticket-priority"
                value={newPriority}
                onChange={(event) => setNewPriority(event.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {createError && (
                <p className="error-message" role="alert">{createError}</p>
              )}

              <button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Submit Ticket"}
              </button>
          </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
