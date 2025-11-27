import { useState } from "react";

function GroupCards({group, user, onInvite, onLeave}){
    const [inviteName, setInviteName] = useState("");
    
    const isMember = group.members.includes(user);
    const isOwner = group.owner === user && isMember;

    const handleInvite = () => {
        if(!inviteName.trim()) return;
        onInvite(group.id, inviteName);
        setInviteName("");
    };

    return (
        <div className = "group-card">
            <div className = "group-header">
                <h3>{group.name}</h3>
                {isMember && (
                    <button className = "leave-group" onClick = {() => onLeave(group.id)}>
                        Leave group
                    </button>
                )}
            </div>
            <p className = "group-owner">{group.owner}</p>

            <div className = "members">
                <h3>Members</h3>
                <ul className = "members-list">
                    {group.members.map((member, index) => (
                        <li key = {index} classname = "member-name">
                            {member}
                        </li>
                    ))}
                </ul>

                {isOwner && (
                    <div className = "invite-members">
                        <input 
                        type = "text"
                        className = "group-input"
                        placeholder = "Invite Student Name"
                        value = {inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        />
                        <button className = "invite-btn" onClick = {handleInvite}>
                            Invite user
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

}

export default function Groups() {
    const user = "You";
    const [groups, setGroups] = useState([]);

    const [newGroupName, setNewGroupName] = useState("");
    const myGroups = groups.filter(group => group.members.includes(user));

    function createGroup(){
        if (!newGroupName.trim()) return;
        const newGroup = {
            id:  Date.now(),
            name:newGroupName,
            owner: user,
            members: [user]
        };
        setGroups([...groups, newGroup]);
    }

    function inviteMember(groupId, newMember) {
        setGroups(groups.map(g => {
            if(g.id ===groupId){
                if(g.members.includes(newMember)) return g;
                return {...g, members: [...g.members, newMember]};
            }
            return g;
        }));
    }

    function leaveGroup(groupId) {
        setGroups(groups.map(g => {
            if(g.id === groupId) {
                return {...g,members: g.members.filter(m => m !== user)};

            }
            return g;
        }));
    }
    return (
        <div>
            <h1>Groups</h1>
            <div>
                <input 
                    type="text" 
                    placeholder="Write your group name" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)} />
                <button onClick={createGroup}>Create</button>
            </div>
            <hr />

            <h2>Groups</h2>
            {myGroups.map((group) => (
                <GroupCards
                    key = {group.id}
                    group = {group}
                    user = {user}
                    onInvite = {inviteMember}
                    onLeave = {leaveGroup}
                />
            ))}
        </div>
    );
}