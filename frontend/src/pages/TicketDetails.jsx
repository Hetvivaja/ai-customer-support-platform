
import { useEffect, useState } from "react";
import "../styles/TicketDetails.css";

function TicketDetails() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ticketId = new URLSearchParams(
    window.location.search
  ).get("id");

  useEffect(() => {
    async function loadTicket() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      if (!ticketId) {
        setError("Ticket ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/tickets/${ticketId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load ticket details.");
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  return (
    <div className="ticket-details-page">
      <button
        className="ticket-details-back"
        onClick={() => (window.location.href = "/my-tickets")}
      >
        ← Back to My Tickets
      </button>

      <h1>Ticket Details</h1>

      {loading && <p>Loading ticket details...</p>}

      {error && <p className="ticket-details-error">{error}</p>}

      {!loading && !error && ticket && (
        <div className="ticket-details-card">
          <h2>{ticket.title}</h2>

          <p className="ticket-details-id">
            Ticket #{ticket.id}
          </p>

          <div className="ticket-details-field">
            <strong>Description</strong>
            <p>{ticket.description}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Status</strong>
            <p>{ticket.status?.replaceAll("_", " ")}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Priority</strong>
            <p>{ticket.priority}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Created At</strong>
            <p>
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleString()
                : "Not available"}
            </p>
          </div>

          <div className="ticket-details-field">
            <strong>Last Updated</strong>
            <p>
              {ticket.updated_at
                ? new Date(ticket.updated_at).toLocaleString()
                : "Not available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetails;
