<<<<<<< Updated upstream
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "10px 20px",
        background: "black",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "2.0rem", color: "#0b5fff"}}>
        Study Group Matcher
      </div>
      <div>
        <Link to="/" style={{ margin: "0 10px", color: "white" }}>Home</Link>
        <Link to="/connections" style={{ margin: "0 10px", color: "white" }}>Connections</Link>
        <Link to="/groups" style={{ margin: "0 10px", color: "white" }}>Groups</Link>
        <Link to="/messages" style={{ margin: "0 10px", color: "white" }}>Messages</Link>
      </div>
    </nav>
  );
}
=======
import {Link, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar(){
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const onStorage = () => {
            const updatedUser = localStorage.getItem("user");
            if (updatedUser) {
                setUser(JSON.parse(updatedUser));
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
    }

    return(
        <nav className="navbar">
            <div className="nav-brand">
                <h2>📚 Study Group Matcher</h2>
            </div>
            <div className="nav-links">
                <Link to = "/" className="nav-link">Home</Link>
                <Link to = "/connections" className="nav-link">Connections</Link>
                <Link to = "/groups" className="nav-link">Groups</Link>
                <Link to = "/messages" className="nav-link">Messages</Link>
            </div>
            <div className="nav-user">
                {user && <span className="user-name">{user.name}</span>}
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
}
>>>>>>> Stashed changes
