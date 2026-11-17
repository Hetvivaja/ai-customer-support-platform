
import "./App.css";
import Login from "./pages/auth/Login";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyTickets from "./pages/customer/MyTickets";
import TicketDetails from "./pages/customer/TicketDetails";
// import Profile from "./pages/customer/Profile";

import AIChat from "./pages/AIChat";
import AgentDashboard from "./pages/agent/AgentDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const path = window.location.pathname;

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  const dashboardRoutes = {
    CUSTOMER: "/dashboard",
    AGENT: "/agent-dashboard",
    MANAGER: "/manager-dashboard",
    ADMIN: "/admin-dashboard",
  };

  // Login
  if (path === "/") {
     if (token && role && dashboardRoutes[role]) {
      window.location.replace(dashboardRoutes[role]);
      return null;
    }
    return <Login />;
  }

  // Authentication check
  if (!token) {
    window.location.href = "/";
    return null;
  }

  // Customer routes
  if (path === "/dashboard" && role === "CUSTOMER") {
    return <CustomerDashboard />;
  }

  if (path === "/my-tickets" && role === "CUSTOMER") {
    return <MyTickets />;
  }

  if (path === "/ticket-details" && role === "CUSTOMER") {
    return <TicketDetails />;
  }

  if (path === "/profile" && role === "CUSTOMER") {
    return <Profile />;
  }

  if (path === "/ai-chat" && role === "CUSTOMER") {
    return <AIChat />;
  }

  // Agent dashboard
  if (path === "/agent-dashboard" && role === "AGENT") {
    return <AgentDashboard />;
  }

  // Manager dashboard
  if (path === "/manager-dashboard" && role === "MANAGER") {
    return <ManagerDashboard />;
  }

  // Admin dashboard
  if (path === "/admin-dashboard" && role === "ADMIN") {
    return <AdminDashboard />;
  }

  // Wrong role or invalid route
  if (dashboardRoutes[role]) {
    window.location.replace(dashboardRoutes[role]);
    return null;
  }

  localStorage.clear();
  window.location.replace("/");
  return null;
}

export default App;
 