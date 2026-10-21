
import { useEffect, useState } from "react";

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
    <div style={{ padding: "30px" }}>
      <h1>My Tickets</h1>
      <p>View your support requests here.</p>

      {loading && <p>Loading tickets...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p>No tickets found.</p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <h3>{ticket.title}</h3>
              <p>Ticket ID: #{ticket.id}</p>
              <p>Priority: {ticket.priority}</p>
              <p>Status: {ticket.status}</p>
              <p>
                Created:{" "}
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
