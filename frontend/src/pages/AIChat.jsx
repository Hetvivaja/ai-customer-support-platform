
import { useEffect, useState } from "react";
import "../styles/AIChat.css";

function AIChat() {
  const [tickets, setTickets] = useState([]);

  const [selectedTicketId, setSelectedTicketId] = useState(
    new URLSearchParams(window.location.search).get("ticketId") || ""
  );

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // Load support requests for the sidebar
  useEffect(() => {
    async function loadTickets() {
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load support requests.");
        }

        const ticketList = Array.isArray(data)
          ? data
          : data.results || [];

        setTickets(ticketList);
      } catch (err) {
        setError(err.message);
      } finally {
        setTicketsLoading(false);
      }
    }

    loadTickets();
  }, []);

  // Load saved conversation when a request is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedTicketId) {
        setMessages([]);
        return;
      }

      setMessages([]);
      setMessagesLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/chat/tickets/${selectedTicketId}/messages/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load conversation history."
          );
        }

        setMessages(
          data.map((message) => ({
            id: message.id,
            type: message.is_ai_generated ? "ai" : "user",
            text: message.content,
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setMessagesLoading(false);
      }
    }

    loadMessages();
  }, [selectedTicketId]);

  // Select a conversation
  function openConversation(ticket) {
    setSelectedTicketId(String(ticket.id));
    setQuestion("");
    setError("");

    window.history.replaceState(
      null,
      "",
      `/ai-chat?ticketId=${ticket.id}`
    );
  }

  // Start a fresh chat selection
  function startNewChat() {
    setSelectedTicketId("");
    setMessages([]);
    setQuestion("");
    setError("");

    window.history.replaceState(
      null,
      "",
      "/ai-chat"
    );
  }

  // Send question to Gemini
  async function sendMessage(event) {
    event.preventDefault();

    if (!question.trim()) {
      setError("Please enter your question.");
      return;
    }

    if (!selectedTicketId) {
      setError("Please select a support request first.");
      return;
    }

    const currentQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      { type: "user", text: currentQuestion },
    ]);

    setQuestion("");
    setError("");
    setSending(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/chat/ai/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: currentQuestion,
            ticket_id: Number(selectedTicketId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get an AI response."
        );
      }

      setMessages((previous) => [
        ...previous,
        { type: "ai", text: data.answer },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);
      setError(err.message || "Could not connect to the server.");
    } finally {
      setSending(false);
    }
  }

  const selectedTicket = tickets.find(
    (ticket) => String(ticket.id) === String(selectedTicketId)
  );

  return (
    <div className="ai-chat-layout">

      {/* LEFT SIDEBAR */}
      <aside className="ai-chat-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">AI</div>
          <h2>Customer Support</h2>
        </div>

        <button
          className="new-chat-button"
          onClick={startNewChat}
        >
          <span>＋</span> New Chat
        </button>

        <div className="chat-history-section">
          <h3>Your Conversations</h3>

          {ticketsLoading && (
            <p className="sidebar-message">
              Loading conversations...
            </p>
          )}

          {!ticketsLoading && tickets.length === 0 && (
            <p className="sidebar-message">
              No support requests found.
            </p>
          )}

          {!ticketsLoading &&
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                className={`history-item ${
                  String(ticket.id) === String(selectedTicketId)
                    ? "active"
                    : ""
                }`}
                onClick={() => openConversation(ticket)}
              >
                <span className="history-icon">◷</span>

                <span className="history-text">
                  <strong>
                    {ticket.title || `Request #${ticket.id}`}
                  </strong>

                  <small>Request #{ticket.id}</small>
                </span>
              </button>
            ))}
        </div>

        <button
          className="sidebar-back-button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
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
                Select a previous conversation from the sidebar
                or choose a support request below to start chatting.
              </p>

              <div className="request-selection">
                <h3>Select a support request</h3>

                {ticketsLoading && (
                  <p>Loading support requests...</p>
                )}

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
            <>
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
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`chat-message ${message.type}`}
                    >
                      <div className="message-avatar">
                        {message.type === "user" ? "You" : "AI"}
                      </div>

                      <div className="message-content">
                        <strong>
                          {message.type === "user"
                            ? "You"
                            : "AI Assistant"}
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
              </div>
            </>
          )}

          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          {/* MESSAGE INPUT */}
          {selectedTicketId && (
            <form
              className="chat-input-area"
              onSubmit={sendMessage}
            >
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Message AI Assistant..."
                rows="1"
                disabled={sending || messagesLoading}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
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
            AI responses may not always be accurate. Please verify important information.
          </p>

        </section>
      </main>
    </div>
  );
}

export default AIChat;
