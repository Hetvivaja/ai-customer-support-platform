import { useNavigate } from "react-router-dom";
import { getTickets, createTicket } from "../../services/ticketService";
import { useEffect, useState } from "react";
import "../../styles/customer/CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.message || "Unable to connect to Django."))
      .finally(() => setLoading(false));
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
      const ticket = await createTicket(newTitle.trim(), newDescription.trim());
      setTickets((previous) => [ticket, ...previous]); // newest first
      setNewTitle("");
      setNewDescription("");
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.message || "Could not create ticket.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Welcome to your support workspace.</p>
          </div>

        
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total Requests</p>
            <h2>{loading ? "..." : tickets.length}</h2>
          </div>

          <div className="stat-card">
            <p>Open Requests</p>
            <h2>{loading ? "..." : openTickets}</h2>
          </div>

          <div className="stat-card">
            <p>Resolved Requests</p>
            <h2>{loading ? "..." : resolvedTickets}</h2>
          </div>
        </section>

        <section className="tickets-panel">
          <h2>My Recent Requests</h2>

          {loading && <p>Loading requests...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && tickets.length === 0 && (
            <p>You have not created any requests yet.</p>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div className="ticket-list">
              {tickets.slice(0, 5).map((ticket) => (
                <div className="ticket-item" key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    style={{ cursor: "pointer" }}>
                    <div>
                      <strong>{ticket.title}</strong>
                      <p>
                        {ticket.priority} priority ·{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
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
            {showCreateForm ? "Cancel" : "+ Create New Request"}
          </button>
            {showCreateForm && (
          <form className="create-ticket-form" onSubmit={handleCreateTicket}>
              <h3>Create a Support Request</h3>

              <label htmlFor="ticket-title">Request Title</label>
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
              {createError && (
                <p className="error-message" role="alert">{createError}</p>
              )}

              <button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Submit Request"}
              </button>
          </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;