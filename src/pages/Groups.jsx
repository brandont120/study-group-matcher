import { useState } from "react";

export default function Groups() {
    const [groups, setGroups] = useState([
        { id: 1, name: "Group Name", members: ["Member Name 1", "Member Name 2"] }
    ]);

    const [joinedGroups, setJoinedGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");

    function joinGroup(group) {
        setJoinedGroups([...joinedGroups, group.id]);
        setGroups(groups.map(g => g.id === group.id ? {...g, members: [...g.members, "You"]} : g));
    }

    function leaveGroup(group) {
        setJoinedGroups(joinedGroups.filter(id => id !== group.id));
        setGroups(groups.map(g => g.id === group.id ? {...g, members: g.members.filter(m => m !== "You")} : g));
    }

    function createGroup() {
        if (!newGroupName.trim()) return;
        const newGroup = {id: groups.length +1, name: newGroupName, members:["you"]};
        setGroups([...groups, newGroup]);
        setJoinedGroups([...joinedGroups, newGroup.id]);
        setNewGroupName("");
    }
    return (
        <div>
            <h1>Groups</h1>
            <div>
                <input type="text" placeholder="Write your group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                <button onClick={createGroup}>Create</button>
            </div>
            <hr />

            <h2>Groups</h2>
            {groups.map((group) => (
                <div key={group.id} style={{ marginBottom: "10px", padding: "10px" }}>
                    <h3>{group.name}</h3>
                    <p>Members: {group.members.join(", ")}</p>
                    {joinedGroups.includes(group.id) ? (
                        <button onClick={() => leaveGroup(group)}>Leave</button>) : (<button onClick={() => joinGroup(group)}>Join</button>)
                    }
                </div>
            ))}
        </div>
    );
}