import {useState} from "react";

export default function Connections(){
    const[recommended, setRecommended] = useState([
        {id: 1, name: "FirstName LastName", major: "Major"}
    ]);

    const [connections, setConnections] = useState([]);

    function connect(user){
        setConnections([...connections, user]);
        setRecommended(recommended.filter((u) => u.id !== user.id));

    }

    return(
        <div>
            <h1>Connections</h1>
            
            <h2>Recommended</h2>
            {recommended.map((user) => (
                <div key = {user.id} style = {{marginBottom: "10px"}}>
                    <p>{user.name} - {user.major}</p>
                    <button onClick = {() => connect(user)}>Add</button>
                </div>
            ))}
            <hr />

            <h2>Current Connections</h2>
            {connections.length === 0 && <p>No connections yet.</p>}
            {connections.map((user) => (
                <div key={user.id} style={{ marginBottom: "10px" }}>
                    <p>{user.name} - {user.major}</p>
                </div>
                ))}
        </div>
    );
}