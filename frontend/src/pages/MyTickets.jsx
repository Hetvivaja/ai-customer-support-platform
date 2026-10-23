
import { useEffect, useState } from "react";
import "../styles/MyTickets.css";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (!response.ok) {
          throw new Error("Unable to load tickets.");
        }

        const data = await response.json();
        setTickets(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="my-tickets-page">
      <header className="my-tickets-header">
        <div>
          <h1>My Tickets</h1>
          <p>View and track your support requests.</p>
        </div>

        <button
          className="my-tickets-back"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      {loading && (
        <p className="my-tickets-message">Loading tickets...</p>
      )}

      {error && (
        <p className="my-tickets-message my-tickets-error">
          {error}
        </p>
      )}

      {!loading && !error && tickets.length === 0 && (
        <p className="my-tickets-message">
          You have not created any tickets yet.
        </p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="my-tickets-list">
          {tickets.map((ticket) => (
            <article className="my-ticket-card" key={ticket.id}>
              <h3>{ticket.title}</h3>

              <p className="my-ticket-id">
                Ticket #{ticket.id}
              </p>

              <p className="my-ticket-description">
                {ticket.description}
              </p>

              <div className="my-ticket-meta">
                <span className="my-ticket-badge my-ticket-status">
                  {ticket.status?.replaceAll("_", " ")}
                </span>

                <span className="my-ticket-badge my-ticket-priority">
                  {ticket.priority}
                </span>
              </div>

              <p className="my-ticket-id">
                Created:{" "}
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString()
                  : "Not available"}
              </p>
              
              <button
                className="my-tickets-back"
                onClick={() =>
                  (window.location.href = `/ticket-details?id=${ticket.id}`)
                }>
                View Details
              </button>

            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
