import { Outlet } from "react-router-dom";
import { logout } from "../services/api";
import { getStoredUser } from "../services/authService";
import "../styles/layouts/Layouts.css";

const ROLE_LABEL = {
  AGENT: "Support Agent",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

function StaffLayout() {
  const user = getStoredUser();
  const role = localStorage.getItem("user_role");

  return (
    <div className="sl-shell">
      <header className="sl-topbar">
        <strong className="sl-brand">AI Support</strong>

        <div className="sl-user">
          <span className="sl-role">{ROLE_LABEL[role] || role}</span>
          {user && <span>{user.username}</span>}
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export default StaffLayout;