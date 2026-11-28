import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../services/api";
import { getStoredUser } from "../services/authService";
import "../styles/layouts/Layouts.css";

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ICONS = {
  dashboard: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  tickets: (
    <svg {...ICON_PROPS}>
      <path d="M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2z" />
      <rect x="4" y="7" width="16" height="14" rx="2" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  ),
  chat: (
    <svg {...ICON_PROPS}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M9 11h6M9 14h3" />
    </svg>
  ),
  profile: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
};

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/my-tickets", label: "My Tickets", icon: "tickets" },
  { to: "/ai-chat", label: "AI Chat", icon: "chat" },
  { to: "/profile", label: "Profile", icon: "profile" },
];

function CustomerLayout() {
  const user = getStoredUser();

  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("cl_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch {
      /* ignore storage errors */
    }
    return window.innerWidth > 700; // closed by default on phones
  });

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem("cl_sidebar_open", String(next));
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <div className="cl-shell">
      <aside className={`cl-sidebar ${open ? "" : "cl-sidebar-collapsed"}`}>
        <div className="cl-sidebar-head">
          {open && <h2>AI Support</h2>}

          <button
            type="button"
            className="cl-toggle"
            onClick={toggle}
            title={open ? "Close menu" : "Open menu"}
            aria-label={open ? "Close main menu" : "Open main menu"}
            aria-expanded={open}
          >
            {/* Sidebar-panel icon: same icon for open and closed */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </button>
        </div>

        {open && (
          <>
            <nav>
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `cl-link ${isActive ? "cl-link-active" : ""}`
                  }
                >
                  {ICONS[link.icon]}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="cl-sidebar-footer">
              {user && <p>{user.username}</p>}
              <button onClick={logout}>Logout</button>
            </div>
          </>
        )}
      </aside>

      <main className="cl-main">
        <Outlet />
      </main>
    </div>
  );
}
export default CustomerLayout;