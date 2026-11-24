import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../services/api";
import { getStoredUser } from "../services/authService";
import "../styles/layouts/Layouts.css";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/my-tickets", label: "My Tickets" },
  { to: "/ai-chat", label: "AI Chat" },
  { to: "/profile", label: "Profile" },
];

function CustomerLayout() {
  const user = getStoredUser();

  return (
    <div className="cl-shell">
      <aside className="cl-sidebar">
        <h2>AI Support</h2>

        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `cl-link ${isActive ? "cl-link-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="cl-sidebar-footer">
          {user && <p>{user.username}</p>}
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="cl-main">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;