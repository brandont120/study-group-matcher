import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Connections.css";

export default function Connections(){
    const [recommended, setRecommended] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        loadRecommendations();
    }, [token, navigate]);

    async function loadRecommendations() {
        try {
            const response = await fetch("http://localhost:5000/api/recommendations/partners", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setRecommended(data);
            } else if (response.status === 401) {
                navigate("/login");
            }
        } catch (err) {
            setError("Failed to load recommendations");
        } finally {
            setLoading(false);
        }
    }

    function connect(user) {
        setConnections([...connections, user]);
        setRecommended(recommended.filter((u) => u.id !== user.id));
    }

    if (loading) return <div style={{padding: "20px"}}><p>Loading recommendations...</p></div>;

    return(
        <div className="connections-container">
            <h1>Study Partners</h1>
            
            {error && <div className="error-message">{error}</div>}

            <div className="connections-grid">
                <div className="section">
                    <h2>Recommended Partners</h2>
                    {recommended.length === 0 ? (
                        <p className="no-data">No recommendations available. Try adding courses to your profile!</p>
                    ) : (
                        <div className="user-list">
                            {recommended.map((user) => (
                                <div key = {user.id} className="user-card">
                                    <div className="user-info">
                                        <h3>{user.name}</h3>
                                        <p className="major">{user.major || "Major not specified"}</p>
                                        <p className="study-style">
                                            <strong>Study Style:</strong> {user.study_style || "Not specified"}
                                        </p>
                                        <p className="match-score">
                                            <strong>Compatibility Score:</strong> {user.score}
                                            {user.shared_courses > 0 && ` • ${user.shared_courses} shared course(s)`}
                                        </p>
                                    </div>
                                    <button 
                                        className="btn-connect"
                                        onClick = {() => connect(user)}
                                    >
                                        Add Connection
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="section">
                    <h2>Your Connections ({connections.length})</h2>
                    {connections.length === 0 && <p className="no-data">No connections yet.</p>}
                    <div className="user-list">
                        {connections.map((user) => (
                            <div key={user.id} className="user-card connected">
                                <div className="user-info">
                                    <h3>{user.name}</h3>
                                    <p className="major">{user.major || "Major not specified"}</p>
                                    <p className="study-style">
                                        <strong>Study Style:</strong> {user.study_style || "Not specified"}
                                    </p>
                                </div>
                                <div className="connection-badge">Connected ✓</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}