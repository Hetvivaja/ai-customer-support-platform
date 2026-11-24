import { Link } from "react-router-dom";
import { getStoredUser } from "../../services/authService";

function Profile() {
  const user = getStoredUser();

  return (
    <div style={{ padding: 32 }}>
      {/* <Link to="/dashboard">← Back to Dashboard</Link> */}
      <h1>My Profile</h1>

      {user ? (
        <>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </>
      ) : (
        <p>Profile information is not available.</p>
      )}
    </div>
  );
}

export default Profile;