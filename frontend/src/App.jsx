import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyTickets from "./pages/customer/MyTickets";
import TicketDetails from "./pages/customer/TicketDetails";
import Profile from "./pages/customer/Profile";
import AIChat from "./pages/AIChat";
import AgentDashboard from "./pages/agent/AgentDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import CustomerLayout from "./layouts/CustomerLayout";
import StaffLayout from "./layouts/StaffLayout";

const DASHBOARD = {
  CUSTOMER: "/dashboard",
  AGENT: "/agent-dashboard",
  MANAGER: "/manager-dashboard",
  ADMIN: "/admin-dashboard",
};

function ProtectedRoute({ allow, children }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  if (!token) return <Navigate to="/" replace />;
  if (!allow.includes(role)) return <Navigate to={DASHBOARD[role] ?? "/"} replace />;
  return children;
}

function LoginRoute() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");
  if (token && DASHBOARD[role]) return <Navigate to={DASHBOARD[role]} replace />;
  return <Login />;
}

const guard = (roles, el) => <ProtectedRoute allow={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRoute />} />

         {/* Customer pages share the sidebar layout */}
        <Route
          element={
            <ProtectedRoute allow={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            {/* Customer */}
          <Route path="/dashboard" element={guard(["CUSTOMER"], <CustomerDashboard />)} />
          <Route path="/my-tickets" element={guard(["CUSTOMER"], <MyTickets />)} />
          <Route path="/profile" element={guard(["CUSTOMER"], <Profile />)} />
          <Route path="/ai-chat" element={guard(["CUSTOMER"], <AIChat />)} /> {/* This is fullscreen AI Layout */}
        </Route>
        {/* Shared ticket page */}
        <Route
          path="/tickets/:id"
          element={guard(["CUSTOMER", "AGENT", "MANAGER", "ADMIN"], <TicketDetails />)}
        />

         {/* Staff pages share the top bar layout */}
        <Route
          element={
            <ProtectedRoute allow={["AGENT", "MANAGER", "ADMIN"]}>
              <StaffLayout />
            </ProtectedRoute>
          }>
          {/* Staff */}
          <Route path="/agent-dashboard" element={guard(["AGENT"], <AgentDashboard />)} />
          <Route path="/manager-dashboard" element={guard(["MANAGER"], <ManagerDashboard />)} />
          <Route path="/admin-dashboard" element={guard(["ADMIN"], <AdminDashboard />)} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}