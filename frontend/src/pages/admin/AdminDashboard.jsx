import { useEffect, useMemo, useState } from "react";
import "../../styles/admin/AdminDashboard.css";
import { createUser, getUsers, updateUser } from "../../services/userService";
import { getStoredUser } from "../../services/authService";

const ROLES = ["CUSTOMER", "AGENT", "MANAGER", "ADMIN"];
const ROLE_LABELS = {
  CUSTOMER: "Customer",
  AGENT: "Agent",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

const EMPTY_FORM = { username: "", email: "", password: "", role: "AGENT" };

function AdminDashboard() {
  const me = getStoredUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || "Unable to load users."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const result = { ALL: users.length };
    ROLES.forEach((r) => (result[r] = 0));
    users.forEach((u) => (result[u.role] = (result[u.role] || 0) + 1));
    return result;
  }, [users]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!term) return true;
      return (
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });
  }, [users, search, roleFilter]);

  async function change(user, changes) {
    setBusyId(user.id);
    setError("");
    try {
      const updated = await updateUser(user.id, changes);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message || "Could not update the user.");
    } finally {
      setBusyId(null);
    }
  }

  function toggleActive(user) {
    const action = user.is_active ? "Deactivate" : "Activate";
    if (!window.confirm(`${action} ${user.username}?`)) return;
    change(user, { is_active: !user.is_active });
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const created = await createUser({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
      });
      setUsers((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || "Could not create the user.");
    } finally {
      setSaving(false);
    }
  }

  const setField = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  return (
    <div className="ad-page">
      <header className="ad-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, roles and account access.</p>
        </div>
        <button
          className="ad-btn ad-btn-primary"
          onClick={() => {
            setFormError("");
            setShowForm((v) => !v);
          }}
        >
          {showForm ? "Cancel" : "+ Add user"}
        </button>
      </header>

      <section className="ad-cards">
        <div className="ad-card">
          <p>Total users</p>
          <h2>{loading ? "..." : counts.ALL}</h2>
        </div>
        {ROLES.map((r) => (
          <div className="ad-card" key={r}>
            <p>{ROLE_LABELS[r]}s</p>
            <h2>{loading ? "..." : counts[r]}</h2>
          </div>
        ))}
      </section>

      {showForm && (
        <form className="ad-panel ad-form" onSubmit={handleCreate}>
          <h3>Create a user</h3>

          <div className="ad-form-grid">
            <label>
              Username
              <input
                type="text"
                value={form.username}
                onChange={setField("username")}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={setField("password")}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={setField("role")}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </label>
          </div>

          {formError && <p className="ad-error">{formError}</p>}

          <button className="ad-btn ad-btn-primary" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create user"}
          </button>
        </form>
      )}

      <section className="ad-panel">
        <div className="ad-toolbar">
          <input
            type="text"
            className="ad-search"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {error && <p className="ad-error">{error}</p>}
        {loading && <p className="ad-muted">Loading users...</p>}

        {!loading && visible.length === 0 && (
          <p className="ad-muted">No users match your search.</p>
        )}

        {!loading && visible.length > 0 && (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => {
                  const isMe = user.id === me?.id;
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className={user.is_active ? "" : "ad-inactive"}>
                      <td>
                        <strong>{user.username}{isMe && " (you)"}</strong>
                        <small>{user.email}</small>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          disabled={isMe || busy}
                          onChange={(e) => change(user, { role: e.target.value })}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`ad-badge ${user.is_active ? "ad-on" : "ad-off"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                      <td>
                        {!isMe && (
                          <button
                            className="ad-btn ad-btn-outline"
                            disabled={busy}
                            onClick={() => toggleActive(user)}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;