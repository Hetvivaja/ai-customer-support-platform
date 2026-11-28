import { useState } from "react";
import { login, DASHBOARD } from "../../services/authService";
import "../../styles/auth/Login.css";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

   async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { role } = await login(email, password);
      window.location.href = DASHBOARD[role];
    } catch (err) {
      setError(err.message || "Unable to connect to Django.");
    } finally {
      setLoading(false);
    }
  }

 return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>AI Support</h1>
        <p>Sign in to your customer support account.</p>

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="login-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
