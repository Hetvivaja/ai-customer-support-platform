import { useEffect, useState } from "react";
import "../../styles/customer/Profile.css";
import {
  changePassword,
  getMe,
  updateProfile,
} from "../../services/authService";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [info, setInfo] = useState({ first_name: "", last_name: "", email: "" });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null); // { type, text }

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        setInfo({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        });
      })
      .catch((err) => setLoadError(err.message || "Unable to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  async function saveInfo(event) {
    event.preventDefault();
    setInfoSaving(true);
    setInfoMessage(null);

    try {
      const updated = await updateProfile(info);
      setUser(updated);
      setInfoMessage({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setInfoMessage({ type: "error", text: err.message });
    } finally {
      setInfoSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setPwMessage(null);

    if (pw.next !== pw.confirm) {
      setPwMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwSaving(true);

    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setPwMessage({ type: "ok", text: "Password changed." });
    } catch (err) {
      setPwMessage({ type: "error", text: err.message });
    } finally {
      setPwSaving(false);
    }
  }

  const setInfoField = (name) => (e) =>
    setInfo((prev) => ({ ...prev, [name]: e.target.value }));
  const setPwField = (name) => (e) =>
    setPw((prev) => ({ ...prev, [name]: e.target.value }));

  if (loading) return <div className="pf-page"><p>Loading profile...</p></div>;
  if (loadError) return <div className="pf-page"><p className="pf-msg pf-error">{loadError}</p></div>;

  return (
    <div className="pf-page">
      <header className="pf-header">
        <div className="pf-avatar">
          {(user.username || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{user.username}</h1>
          <p>{user.email}</p>
        </div>
      </header>

      <form className="pf-panel" onSubmit={saveInfo}>
        <h3>Personal information</h3>

        <div className="pf-grid">
          <label>
            Username
            <input type="text" value={user.username} disabled />
          </label>
          <label>
            Email
            <input
              type="email"
              value={info.email}
              onChange={setInfoField("email")}
              required
            />
          </label>
          <label>
            First name
            <input
              type="text"
              value={info.first_name}
              onChange={setInfoField("first_name")}
              maxLength={150}
            />
          </label>
          <label>
            Last name
            <input
              type="text"
              value={info.last_name}
              onChange={setInfoField("last_name")}
              maxLength={150}
            />
          </label>
        </div>

        {infoMessage && (
          <p className={`pf-msg pf-${infoMessage.type}`}>{infoMessage.text}</p>
        )}

        <button className="pf-btn" type="submit" disabled={infoSaving}>
          {infoSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form className="pf-panel" onSubmit={savePassword}>
        <h3>Change password</h3>

        <div className="pf-grid">
          <label>
            Current password
            <input
              type="password"
              value={pw.current}
              onChange={setPwField("current")}
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            New password (at least 8 characters)
            <input
              type="password"
              value={pw.next}
              onChange={setPwField("next")}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={pw.confirm}
              onChange={setPwField("confirm")}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {pwMessage && (
          <p className={`pf-msg pf-${pwMessage.type}`}>{pwMessage.text}</p>
        )}

        <button className="pf-btn" type="submit" disabled={pwSaving}>
          {pwSaving ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
}

export default Profile;