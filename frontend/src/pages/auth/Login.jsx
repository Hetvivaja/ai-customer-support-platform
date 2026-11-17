
import { useState } from "react";
import "../../styles/auth/Login.css";

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
      // 1. Login API
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
             email:email.trim(),
              password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password."
        );
      }

      // 2. Save JWT tokens 
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // 3. Get Logged in User Details
      const userResponse = await fetch(
        "http://127.0.0.1:8000/api/auth/me/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );
      const user = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          user.detail || "Unable to get user details."
        );
      }
      // 4. Get User role
      const role = user.role?.toUpperCase();

      // 5. Decide dashboard based on role
      const dashboardRoutes = {
        CUSTOMER: "/dashboard",
        AGENT: "/agent-dashboard",
        MANAGER: "/manager-dashboard",
        ADMIN: "/admin-dashboard",
      };

      const dashboard = dashboardRoutes[role];

      if (!dashboard) {
        throw new Error("Your account has an invalid role.");
      }

      // 6. Save Information
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_data", JSON.stringify(user));

      // 7. Redirect to dashboard after successful login
      window.location.href = dashboard;

    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");

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
      </form>
    </div>
  );
}

export default Login;
