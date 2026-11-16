
import { useState } from "react";
import "../styles/AIChat.css";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event) {
    event.preventDefault();

    if (!question.trim() || !ticketId) {
      setError("Please enter your question and ticket ID.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    const currentQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      { type: "user", text: currentQuestion },
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      console.log("Sending AI request:", currentQuestion, ticketId);
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
            ticket_id: Number(ticketId),
          }),
        }
      );

      const data = await response.json();
      console.log("AI response:", response.status, data);

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
      setLoading(false);
    }
  }

  return (
    <div className="ai-chat-page">
      <header className="ai-chat-header">
        <div>
          <h1>AI Customer Support</h1>
          <p>Ask a question and get help from AI.</p>
        </div>

        <button
          className="ai-chat-back"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      <section className="ai-chat-card">
        <label htmlFor="ticketId">Ticket ID</label>

        <input
          id="ticketId"
          type="number"
          min="1"
          value={ticketId}
          onChange={(event) => setTicketId(event.target.value)}
          placeholder="Enter your ticket ID, e.g. 1"
        />

        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <p className="ai-chat-empty">
              Hello! Select a ticket and ask your question.
            </p>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`ai-chat-message ${message.type}`}
            >
              <strong>
                {message.type === "user" ? "You" : "AI Assistant"}
              </strong>
              <p>{message.text}</p>
            </div>
          ))}

          {loading && (
            <p className="ai-chat-loading">
              AI is preparing your answer...
            </p>
          )}
        </div>

        {error && (
          <p className="ai-chat-error">{error}</p>
        )}

        <form onSubmit={sendMessage} className="ai-chat-form">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Type your question here..."
            rows="3"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AIChat;