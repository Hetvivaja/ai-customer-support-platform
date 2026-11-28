import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../styles/AIChat.css";
import { getTickets } from "../services/ticketService";
import {
  askConversation,
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
} from "../services/chatService";

function AIChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketParam = searchParams.get("ticketId");

  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [active, setActive] = useState(null); // the open conversation
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState(null); // new chat not saved yet
  const [picking, setPicking] = useState(false); // choosing a ticket

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch {
      /* ignore storage errors */
    }
    return window.innerWidth > 700; // closed by default on phones
  });

  const endRef = useRef(null);
  const skipLoadId = useRef(null); // conversation we just created ourselves
  const ticketParamHandled = useRef(false);

  function toggleSidebar() {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    try {
      localStorage.setItem("ai_sidebar_open", String(next));
    } catch {
      /* ignore storage errors */
    }
  }

  // Sidebar history and the tickets used by "Ticket-based chat"
  useEffect(() => {
    Promise.all([getConversations(), getTickets()])
      .then(([convs, tix]) => {
        setConversations(convs);
        setTickets(tix);
      })
      .catch((err) => setError(err.message))
      .finally(() => setListLoading(false));
  }, []);

  // Open a saved conversation from the URL
  useEffect(() => {
    if (!conversationId) {
      setActive(null);
      setMessages([]);
      return;
    }

    if (skipLoadId.current === conversationId) {
      skipLoadId.current = null; // we just created it, state is already set
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");
    setDraft(null);
    setMessages([]);

    getConversation(conversationId)
      .then((data) => {
        if (!alive) return;
        setActive(data);
        setMessages(data.messages);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [conversationId]);

  // Coming from "Ask AI" on a ticket: /ai-chat?ticketId=5
  useEffect(() => {
    if (listLoading || !ticketParam || conversationId || ticketParamHandled.current) {
      return;
    }
    ticketParamHandled.current = true;

    const ticket = tickets.find((t) => String(t.id) === ticketParam);
    if (ticket) {
      setDraft({ ticketId: ticket.id, ticketTitle: ticket.title });
    } else {
      setError("That support ticket was not found.");
    }
    setSearchParams({}, { replace: true });
  }, [listLoading, ticketParam, conversationId, tickets, setSearchParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  function startNewChat() {
    setDraft(null);
    setPicking(false);
    setQuestion("");
    setError("");
    navigate("/ai-chat");
  }

  function startGeneralChat() {
    setDraft({ ticketId: null, ticketTitle: null });
  }

  function startTicketChat(ticket) {
    setPicking(false);
    setDraft({ ticketId: ticket.id, ticketTitle: ticket.title });
  }

  function openConversation(conversation) {
    setDraft(null);
    setPicking(false);
    setQuestion("");
    setError("");
    navigate(`/ai-chat/${conversation.id}`);
  }

  async function removeConversation(conversation) {
    if (!window.confirm("Delete this conversation?")) return;

    try {
      await deleteConversation(conversation.id);
      setConversations((prev) => prev.filter((c) => c.id !== conversation.id));
      if (String(conversation.id) === conversationId) startNewChat();
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();

    const text = question.trim();
    if (!text || sending) return;

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "USER", content: text }]);
    setQuestion("");
    setError("");
    setSending(true);

    try {
      let id = conversationId;

      // First message of a new chat: save the conversation now.
      if (!id) {
        const created = await createConversation(draft?.ticketId ?? null);
        id = String(created.id);
        skipLoadId.current = id;
        setActive(created);
        setConversations((prev) => [created, ...prev]);
        setDraft(null);
        navigate(`/ai-chat/${id}`, { replace: true });
      }

      const data = await askConversation(id, text);
      setMessages((prev) => [...prev, data.message]);
      setActive(data.conversation);
      setConversations((prev) => [
        data.conversation,
        ...prev.filter((c) => c.id !== data.conversation.id),
      ]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setQuestion(text);
      setError(err.message || "Could not connect to the server.");
    } finally {
      setSending(false);
    }
  }

  const inChat = Boolean(conversationId || draft);
  const linkedTitle = active?.ticket_title || draft?.ticketTitle || null;

  return (
    <div className="ai-chat-layout">
      {/* LEFT SIDEBAR: AI conversations only */}
      <aside
        className={`ai-chat-sidebar ${sidebarOpen ? "" : "ai-chat-sidebar-closed"}`}
      >
        <div className="sidebar-brand">
          <h2>AI Assistant</h2>

          <button
            type="button"
            className="sidebar-arrow"
            onClick={toggleSidebar}
            title="Close sidebar"
            aria-label="Close AI sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <span>＋</span> New Chat
        </button>

        <div className="chat-history-section">
          <h3>Your Chats</h3>

          {listLoading && <p className="sidebar-message">Loading chats...</p>}

          {!listLoading && conversations.length === 0 && (
            <p className="sidebar-message">No chats yet. Start a new one.</p>
          )}

          {conversations.map((c) => (
            <div
              key={c.id}
              className={`history-row ${
                String(c.id) === conversationId ? "active" : ""
              }`}
            >
              <button className="history-item" onClick={() => openConversation(c)}>
                <span className="history-icon">{c.ticket ? "🎫" : "💬"}</span>
                <span className="history-text">
                  <strong>{c.title}</strong>
                  <small>
                    {c.ticket ? "About a support ticket" : "General chat"}
                  </small>
                </span>
              </button>
              <button
                className="history-delete"
                title="Delete chat"
                onClick={() => removeConversation(c)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          className="sidebar-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </aside>

      {/* MAIN AREA */}
      <main className="ai-chat-main">
        <header className="chat-topbar">
          {!sidebarOpen && (
            <button
              type="button"
              className="topbar-toggle"
              onClick={toggleSidebar}
              title="Open sidebar"
              aria-label="Open AI sidebar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          )}

          <div className="chat-topbar-text">
            <h1>{active?.title || "AI Assistant"}</h1>
            <p>
              {linkedTitle
                ? `Using your support ticket: ${linkedTitle}`
                : "Ask anything. Chats are saved automatically."}
            </p>
          </div>

          <div className="ai-badge">AI assistant, not a human agent</div>
        </header>

        <section className="chat-content">
          {!inChat ? (
            <div className="chat-welcome">
              <div className="welcome-icon">✦</div>
              <h2>How can I help you today?</h2>
              <p>Choose how you want to start this chat.</p>

              {!picking ? (
                <div className="request-selection">
                  <button className="request-option" onClick={startGeneralChat}>
                    <span>💬</span>
                    <span>
                      <strong>General AI chat</strong>
                      <small>Ask any question. No support ticket needed.</small>
                    </span>
                    <span className="request-arrow">→</span>
                  </button>

                  <button className="request-option" onClick={() => setPicking(true)}>
                    <span>🎫</span>
                    <span>
                      <strong>Chat about a ticket</strong>
                      <small>The AI will use that ticket's details to help you.</small>
                    </span>
                    <span className="request-arrow">→</span>
                  </button>
                </div>
              ) : (
                <div className="request-selection">
                  <h3>Select a ticket</h3>

                  {tickets.length === 0 && (
                    <p>You don't have any tickets yet.</p>
                  )}

                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      className="request-option"
                      onClick={() => startTicketChat(ticket)}
                    >
                      <span>🎫</span>
                      <span>
                        <strong>{ticket.title}</strong>
                        <small>{ticket.status.replace("_", " ")}</small>
                      </span>
                      <span className="request-arrow">→</span>
                    </button>
                  ))}

                  <button className="chat-link-button" onClick={() => setPicking(false)}>
                    ← Back
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="chat-messages">
              {loading && (
                <p className="chat-info-message">Loading messages...</p>
              )}

              {!loading && messages.length === 0 && (
                <div className="chat-empty">
                  <div className="welcome-icon">✦</div>
                  <h2>
                    {linkedTitle ? "Ask about your ticket" : "Start a conversation"}
                  </h2>
                  <p>
                    {linkedTitle
                      ? "I already know the details of your support ticket."
                      : "Type your question below."}
                  </p>
                </div>
              )}

              {!loading &&
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-message ${m.role === "USER" ? "user" : "ai"}`}
                  >
                    <div className="message-avatar">
                      {m.role === "USER" ? "You" : "AI"}
                    </div>
                    <div className="message-content">
                      <strong>{m.role === "USER" ? "You" : "AI Assistant"}</strong>
                      <p>{m.content}</p>
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

              <div ref={endRef} />
            </div>
          )}

          {error && <div className="chat-error">{error}</div>}

          {inChat && (
            <form className="chat-input-area" onSubmit={sendMessage}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Message AI Assistant..."
                rows="1"
                maxLength={2000}
                disabled={sending || loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || loading || !question.trim()}
              >
                ↑
              </button>
            </form>
          )}

          <p className="chat-disclaimer">
            AI responses may not always be accurate. Need a person? Create a
            support ticket from your dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AIChat;