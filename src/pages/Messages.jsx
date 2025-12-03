import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || '{"name":"User"}');

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        // Load conversations from backend
        fetchConversations();
        // If navigated with toUser state, set active conversation object
        if (location.state?.toUser) {
            setActiveConversation(location.state.toUser);
            fetchConversationMessages(location.state.toUser.id);
        }
    }, [location.state]);

    async function fetchConversations() {
        try {
            const response = await fetch("http://localhost:5000/api/messages/conversations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // normalize conversations to include user id and name
                const convList = data.map((c, idx) => ({
                    id: idx,
                    user: c.user,
                    last_message: c.last_message
                }));
                setConversations(convList);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    }

    async function searchUsers() {
        if (!searchUser.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/messages/users/search?q=${encodeURIComponent(searchUser)}`, {
                headers: { Authorization: token ? `Bearer ${token}` : undefined }
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error("Error searching users:", error);
        }
    }

    async function startConversation(userObj) {
        // userObj is an object with id and name
        setActiveConversation(userObj);
        setSearchUser("");
        setSearchResults([]);
        // load messages for this conversation
        fetchConversationMessages(userObj.id);
        // refresh conversation list
        fetchConversations();
    }

    async function fetchConversationMessages(otherUserId) {
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Build a temporary conversation object for display
                const conv = { user: { id: otherUserId, name: activeConversation?.name || "" }, messages: data.messages };
                // If activeConversation is object, preserve its name
                setConversations(prev => {
                    // replace or add
                    const others = prev.filter(p => p.user?.id !== otherUserId);
                    return [ { id: otherUserId, user: conv.user, messages: data.messages }, ...others ];
                });
            }
        } catch (error) {
            console.error("Error fetching conversation messages:", error);
        }
    }

    async function sendMessage() {
        if (!newMessage.trim() || !activeConversation) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/messages`, {
                method: "POST",
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                body: JSON.stringify({
                    recipient_id: activeConversation.id,
                    text: newMessage
                })
            });
            if (response.ok) {
                setNewMessage("");
                // refresh messages and conversations
                fetchConversationMessages(activeConversation.id);
                fetchConversations();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // activeConversation may be an object {id,name} or a string
    const currentConv = conversations.find(conv => conv.user?.id === activeConversation?.id || conv.user?.name === activeConversation?.name || conv.user?.name === activeConversation);

    return (
        <div className="messages-container">
            <div className="conversations-sidebar">
                <h3>Messages</h3>
                
                <div className="user-search">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        onKeyUp={searchUsers}
                        className="search-input"
                    />
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(u => (
                                <div key={u.id} className="search-result-item" onClick={() => startConversation(u.name)}>
                                    <p className="result-name">{u.name}</p>
                                    <p className="result-major">{u.major || "No major"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <p className="no-conversations">No conversations yet. Search users to start.</p>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`conversation-item ${conv.name === activeConversation ? 'active' : ''}`}
                                onClick={() => setActiveConversation(conv.name)}
                            >
                                <div className="conversation-avatar">
                                    {conv.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="conversation-info">
                                    <p className="conversation-name">{conv.name}</p>
                                    <p className="conversation-preview">
                                        {conv.messages[conv.messages.length - 1]?.text?.substring(0, 30)}...
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="chat-area">
                {currentConv && activeConversation ? (
                    <>
                        <div className="chat-header">
                            <h2>{activeConversation}</h2>
                        </div>
                        
                        <div className="messages-display">
                            {currentConv?.messages?.map((msg) => (
                                <div key={msg.id} className={`message ${msg.from === user.name || msg.from === user.id ? 'sent' : 'received'}`}>
                                    <p className="message-text">{msg.text}</p>
                                    <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="message-input-area">
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="message-input"
                            />
                            <button onClick={sendMessage} className="send-btn" disabled={loading}>
                                {loading ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-conversation-selected">
                        <p>Select a conversation or search for a user to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}