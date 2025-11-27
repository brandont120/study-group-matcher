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
