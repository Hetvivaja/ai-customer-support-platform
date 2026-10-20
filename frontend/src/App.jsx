
import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (window.location.pathname === "/dashboard") {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "/";
      return null;
    }
    return <Dashboard />;
  }

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.non_field_errors?.[0] ||
          "Invalid email or password."
        );
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      alert("Login successful!");

      // Redirect to the dashboard after successful login
      window.location.href = "/dashboard";

      // Next, we will redirect the user to the dashboard.
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Django. Check the backend and CORS settings."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="login-card">
        <h1>Welcome Back!</h1>

        <p className="subtitle">
          Sign in to your AI Customer Support Platform
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="footer-text">
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  );
}

export default App;
