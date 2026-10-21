
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "/";
      return null;
    }

    return <Dashboard />;
  }

  return <Login />;
}

export default App;
