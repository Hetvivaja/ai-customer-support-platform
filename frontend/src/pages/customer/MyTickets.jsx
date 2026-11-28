import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/customer/MyTickets.css";
import { getTickets } from "../../services/ticketService";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const result = { ALL: tickets.length };
    tickets.forEach((t) => {
      result[t.status] = (result[t.status] || 0) + 1;
    });
    return result;
  }, [tickets]);

  const visible =
    filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="mt-page">
      <header className="mt-header">
        <h1>My Support Tickets</h1>
        <p>Track the tickets you sent to the support team.</p>
      </header>

      <div className="mt-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`mt-filter ${filter === f.key ? "mt-filter-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span>{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      {loading && <p className="mt-message">Loading requests...</p>}
      {error && <p className="mt-message mt-error">{error}</p>}

      {!loading && !error && visible.length === 0 && (
        <p className="mt-message">
          {tickets.length === 0
            ? "You have not created any requests yet."
            : "No requests in this category."}
        </p>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="mt-grid">
          {visible.map((ticket) => (
            <article className="mt-card" key={ticket.id}>
              <div className="mt-card-top">
                <h3>{ticket.title}</h3>
                <span className={`mt-badge mt-status-${ticket.status}`}>
                  {ticket.status.replaceAll("_", " ")}
                </span>
              </div>

              <p className="mt-description">{ticket.description}</p>

              <div className="mt-meta">
                <span className={`mt-badge mt-priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
                <span className="mt-date">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
                {ticket.assigned_agent_name && (
                  <span className="mt-date">
                    · Agent: {ticket.assigned_agent_name}
                  </span>
                )}
              </div>

              <div className="mt-actions">
                <button
                  className="mt-btn mt-btn-primary"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  View Details
                </button>
                <button
                  className="mt-btn mt-btn-outline"
                  onClick={() => navigate(`/ai-chat?ticketId=${ticket.id}`)}
                >
                  ✦ Ask AI
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;