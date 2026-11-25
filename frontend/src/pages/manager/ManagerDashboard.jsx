import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/manager/ManagerDashboard.css";
import {
  assignTicket,
  getAgents,
  getTicketStats,
  getTickets,
} from "../../services/ticketService";

const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function BarList({ title, data, labels, total, kind }) {
  return (
    <section className="mg-panel">
      <h3>{title}</h3>
      {Object.keys(labels).map((key) => {
        const count = data?.[key] ?? 0;
        const percent = total ? Math.round((count / total) * 100) : 0;
        return (
          <div className="mg-bar-row" key={key}>
            <span className="mg-bar-label">{labels[key]}</span>
            <div className="mg-bar-track">
              <div
                className={`mg-bar-fill mg-${kind}-${key}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="mg-bar-count">{count}</span>
          </div>
        );
      })}
    </section>
  );
}

function ManagerDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, t, a] = await Promise.all([
        getTicketStats(),
        getTickets(),
        getAgents(),
      ]);
      setStats(s);
      setTickets(t);
      setAgents(a);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAssign(ticketId, agentId) {
    if (!agentId) return;
    setAssigningId(ticketId);
    setActionError("");

    try {
      await assignTicket(ticketId, Number(agentId));
      await load(); // refresh cards, queue and workload together
    } catch (err) {
      setActionError(err.message || "Could not assign the ticket.");
    } finally {
      setAssigningId(null);
    }
  }

  const unassigned = tickets.filter(
    (t) =>
      !t.assigned_agent && !["RESOLVED", "CLOSED"].includes(t.status)
  );
  const recent = tickets.slice(0, 8);
  const show = (value) => (loading ? "..." : value ?? 0);

  return (
    <div className="mg-page">
      <header className="mg-header">
        <h1>Manager Dashboard</h1>
        <p>Track the team's tickets and assign work to agents.</p>
      </header>

      {error && <p className="mg-error">{error}</p>}
      {actionError && <p className="mg-error">{actionError}</p>}

      <section className="mg-cards">
        <div className="mg-card">
          <p>Total Tickets</p>
          <h2>{show(stats?.total)}</h2>
        </div>
        <div className="mg-card mg-card-warn">
          <p>Unassigned</p>
          <h2>{show(stats?.unassigned)}</h2>
        </div>
        <div className="mg-card">
          <p>Open</p>
          <h2>{show(stats?.by_status?.OPEN)}</h2>
        </div>
        <div className="mg-card">
          <p>In Progress</p>
          <h2>{show(stats?.by_status?.IN_PROGRESS)}</h2>
        </div>
      </section>

      <section className="mg-two">
        <BarList
          title="Tickets by status"
          data={stats?.by_status}
          labels={STATUS_LABELS}
          total={stats?.total}
          kind="status"
        />
        <BarList
          title="Tickets by priority"
          data={stats?.by_priority}
          labels={PRIORITY_LABELS}
          total={stats?.total}
          kind="priority"
        />
      </section>

      <section className="mg-panel">
        <h3>Unassigned queue ({unassigned.length})</h3>

        {!loading && unassigned.length === 0 && (
          <p className="mg-muted">Every active ticket has an agent.</p>
        )}

        {unassigned.map((ticket) => (
          <div className="mg-row" key={ticket.id}>
            <div
              className="mg-row-main"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <strong>{ticket.title}</strong>
              <small>
                {ticket.customer_name} ·{" "}
                {new Date(ticket.created_at).toLocaleDateString()}
              </small>
            </div>

            <span className={`mg-badge mg-priority-${ticket.priority}`}>
              {ticket.priority}
            </span>

            <select
              value=""
              disabled={assigningId === ticket.id || agents.length === 0}
              onChange={(e) => handleAssign(ticket.id, e.target.value)}
            >
              <option value="">
                {agents.length === 0 ? "No agents" : "Assign to..."}
              </option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.username} ({agent.active_tickets} active)
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>

      <section className="mg-panel">
        <h3>Agent workload</h3>

        {!loading && agents.length === 0 ? (
          <p className="mg-muted">No active agents yet.</p>
        ) : (
          <div className="mg-table-wrap">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Email</th>
                  <th>Active tickets</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td>{agent.username}</td>
                    <td>{agent.email}</td>
                    <td>{agent.active_tickets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mg-panel">
        <h3>Recent tickets</h3>

        {recent.map((ticket) => (
          <div className="mg-row" key={ticket.id}>
            <div
              className="mg-row-main"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <strong>{ticket.title}</strong>
              <small>
                {ticket.customer_name} ·{" "}
                {ticket.assigned_agent_name
                  ? `Agent: ${ticket.assigned_agent_name}`
                  : "Unassigned"}
              </small>
            </div>

            <span className={`mg-badge mg-priority-${ticket.priority}`}>
              {ticket.priority}
            </span>
            <span className={`mg-badge mg-status-${ticket.status}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ManagerDashboard;