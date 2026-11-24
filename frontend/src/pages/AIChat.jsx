import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/AIChat.css";
import { getTickets } from "../services/ticketService";
import { askAI, getMessages } from "../services/chatService";

const isClosed = (ticket) =>
  ["RESOLVED", "CLOSED"].includes(ticket?.status);

function AIChat() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTicketId = searchParams.get("ticketId") || "";

  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Support requests for the sidebar
  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setTicketsLoading(false));
  }, []);

  // Saved AI conversation for the selected request
  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }

    let active = true; // ignore results if the user switched tickets
    setMessages([]);
    setMessagesLoading(true);
    setError("");

    getMessages(selectedTicketId, "AI")
      .then((data) => {
        if (!active) return;
        setMessages(
          data.map((m) => ({
            id: m.id,
            type: m.is_ai_generated ? "ai" : "user",
            text: m.content,
          }))
        );
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setMessagesLoading(false));

    return () => {
      active = false;
    };
  }, [selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  const selectedTicket = tickets.find(
    (ticket) => String(ticket.id) === String(selectedTicketId)
  );
  const readOnly = isClosed(selectedTicket);

  function openConversation(ticket) {
    setQuestion("");
    setError("");
    setSearchParams({ ticketId: String(ticket.id) }, { replace: true });
  }

  function startNewChat() {
    setQuestion("");
    setError("");
    setSearchParams({}, { replace: true });
  }

  async function sendMessage(event) {
    event.preventDefault();

    const currentQuestion = question.trim();
    if (!currentQuestion || sending || !selectedTicketId) return;

    const tempId = `temp-${Date.now()}`;
    setMessages((previous) => [
      ...previous,
      { id: tempId, type: "user", text: currentQuestion },
    ]);
    setQuestion("");
    setError("");
    setSending(true);

    try {
      const data = await askAI(selectedTicketId, currentQuestion);
      setMessages((previous) => [
        ...previous,
        { id: `ai-${Date.now()}`, type: "ai", text: data.answer },
      ]);
    } catch (err) {
      // The backend saves nothing on failure, so undo the optimistic message.
      setMessages((previous) => previous.filter((m) => m.id !== tempId));
      setQuestion(currentQuestion);
      setError(err.message || "Could not connect to the server.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ai-chat-layout">
      {/* LEFT SIDEBAR */}
      <aside className="ai-chat-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">AI</div>
          <h2>Customer Support</h2>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <span>＋</span> New Chat
        </button>

        <div className="chat-history-section">
          <h3>Your Conversations</h3>

          {ticketsLoading && (
            <p className="sidebar-message">Loading conversations...</p>
          )}

          {!ticketsLoading && tickets.length === 0 && (
            <p className="sidebar-message">No support requests found.</p>
          )}

          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              className={`history-item ${
                String(ticket.id) === String(selectedTicketId) ? "active" : ""
              }`}
              onClick={() => openConversation(ticket)}
            >
              <span className="history-icon">◷</span>
              <span className="history-text">
                <strong>{ticket.title || `Request #${ticket.id}`}</strong>
                <small>
                  Request #{ticket.id}
                  {isClosed(ticket) && " · closed"}
                </small>
              </span>
            </button>
          ))}
        </div>

        <button
          className="sidebar-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="ai-chat-main">
        <header className="chat-topbar">
          <div>
            <h1>AI Assistant</h1>
            <p>
              {selectedTicket
                ? `Request #${selectedTicket.id} · ${selectedTicket.title}`
                : "Your personal customer support assistant"}
            </p>
          </div>

          <div className="ai-status">
            <span></span> AI Online
          </div>
        </header>

        <section className="chat-content">
          {!selectedTicketId ? (
            <div className="chat-welcome">
              <div className="welcome-icon">✦</div>
              <h2>How can I help you today?</h2>
              <p>
                Select a previous conversation from the sidebar or choose a
                support request below to start chatting.
              </p>

              <div className="request-selection">
                <h3>Select a support request</h3>

                {ticketsLoading && <p>Loading support requests...</p>}

                {!ticketsLoading && tickets.length === 0 && (
                  <p>You don't have any support requests yet.</p>
                )}

                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    className="request-option"
                    onClick={() => openConversation(ticket)}
                  >
                    <span>💬</span>
                    <span>
                      <strong>{ticket.title}</strong>
                      <small>Request #{ticket.id}</small>
                    </span>
                    <span className="request-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {messagesLoading && (
                <p className="chat-info-message">
                  Loading previous messages...
                </p>
              )}

              {!messagesLoading && messages.length === 0 && (
                <div className="chat-empty">
                  <div className="welcome-icon">✦</div>
                  <h2>Let's solve your problem.</h2>
                  <p>Ask me anything about this support request.</p>
                </div>
              )}

              {!messagesLoading &&
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.type}`}
                  >
                    <div className="message-avatar">
                      {message.type === "user" ? "You" : "AI"}
                    </div>
                    <div className="message-content">
                      <strong>
                        {message.type === "user" ? "You" : "AI Assistant"}
                      </strong>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}

              {sending && (
                <div className="chat-message ai">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <strong>AI Assistant</strong>
                    <p>Thinking...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && <div className="chat-error">{error}</div>}

          {selectedTicketId && readOnly && (
            <p className="chat-closed-note">
              This request is resolved or closed, so the AI chat is read-only.
            </p>
          )}

          {selectedTicketId && !readOnly && (
            <form className="chat-input-area" onSubmit={sendMessage}>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Message AI Assistant..."
                rows="1"
                maxLength={2000}
                disabled={sending || messagesLoading}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || messagesLoading || !question.trim()}
              >
                ↑
              </button>
            </form>
          )}

          <p className="chat-disclaimer">
            AI responses may not always be accurate. Please verify important
            information.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AIChat;