import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/customer/TicketDetails.css";
import { getTicket } from "../../services/ticketService";
import { DASHBOARD } from "../../services/authService";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getTicket(id)
      .then(setTicket)
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setLoading(false));
  }, [id]);

  const backPath = role === "CUSTOMER" ? "/my-tickets" : DASHBOARD[role] || "/";
  const backLabel = role === "CUSTOMER" ? "← Back to My Tickets" : "← Back to Dashboard";

  return (
    <div className="ticket-details-page">
      {/* <button className="ticket-details-back" onClick={() => navigate(backPath)}>
        {backLabel}
      </button> */}

      <h1>Ticket Details</h1>

      {loading && <p>Loading ticket details...</p>}
      {error && <p className="ticket-details-error">{error}</p>}

      {!loading && !error && ticket && (
        <div className="ticket-details-card">
          <h2>{ticket.title}</h2>
          <p className="ticket-details-id">Ticket #{ticket.id}</p>

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
            <strong>Customer</strong>
            <p>{ticket.customer_name}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Assigned agent</strong>
            <p>{ticket.assigned_agent_name || "Not assigned yet"}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Created At</strong>
            <p>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "Not available"}</p>
          </div>

          <div className="ticket-details-field">
            <strong>Last Updated</strong>
            <p>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : "Not available"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetails;