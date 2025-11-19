import { useState } from "react";

export default function Messages() {
    const [conversations, setConversations] = useState([
        { id: 1, name: "First Name", messages: ["Test"] }
    ]);

    const [activeConversation, setActiveConversation] = useState(conversations[0].id);
    const [newMessage, setNewMessage] = useState("");

    function sendMessage() {
        if (!newMessage.trim()) return;

        setConversations(conversations.map(
            conv =>conv.id === activeConversation ? { ...conv, messages: [...conv.messages, "You: " + newMessage] } : conv
            ));
        setNewMessage("");
    }
    const currentConv = conversations.find(conv => conv.id === activeConversation);

    return (
        <div style={{ display: "flex" }}>
            <div style={{width: "200px", padding: "10px" }}>
                <h3>Conversations</h3>
                {conversations.map(conv => (
                <div key={conv.id} style={{padding: "5px", cursor: "pointer", background: conv.id === activeConversation ? "black" : "white"}} onClick={() => setActiveConversation(conv.id)}>
                    {conv.name}
                </div>
                ))}
            </div>
            <div style={{ flex: 1, padding: "10px" }}>
                <h3>{currentConv.name}</h3>
                <div style={{minHeight: "500px", padding: "10px", marginBottom: "10px", overflowY: "auto" }}>
                {currentConv.messages.map((msg, i) => (
                    <p key={i}>{msg}</p>
                ))}
            </div>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write message" style={{width: "50%", marginRight: "10px" }}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    </div>
    );
}