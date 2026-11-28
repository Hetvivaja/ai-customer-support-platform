import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/Login.css";
import { DASHBOARD, login, register } from "../../services/authService";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(form.username, form.email, form.password);
    } catch (err) {
      setError(err.message || "Could not create the account.");
      setLoading(false);
      return;
    }

    // Account created: sign in automatically.
    try {
      const { role } = await login(form.email, form.password);
      window.location.href = DASHBOARD[role];
    } catch {
      setError("Account created. Please sign in from the login page.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Sign up to contact our support team.</p>

        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          value={form.username}
          onChange={setField("username")}
          autoComplete="username"
          required
        />

        <label htmlFor="reg-email">Email address</label>
        <input
          id="reg-email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          autoComplete="email"
          required
        />

        <label htmlFor="reg-password">Password (at least 8 characters)</label>
        <input
          id="reg-password"
          type="password"
          value={form.password}
          onChange={setField("password")}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label htmlFor="reg-confirm">Confirm password</label>
        <input
          id="reg-confirm"
          type="password"
          value={form.confirm}
          onChange={setField("confirm")}
          autoComplete="new-password"
          required
        />

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="login-switch">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;