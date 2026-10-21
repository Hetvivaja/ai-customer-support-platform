
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";

function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem("access_token");

  if (path === "/") {
    if (token) {
      window.location.href = "/dashboard";
      return null;
    }
    return <Login />;
  }

  if (!token) {
    window.location.href = "/";
    return null;
  }

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  if (path === "/my-tickets") {
    return <MyTickets />;
  }

  return <h1>Page not found</h1>;
}

export default App;
 