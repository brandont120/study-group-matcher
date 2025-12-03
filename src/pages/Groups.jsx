import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Groups.css";

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
<<<<<<< Updated upstream
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
=======
    const [availableGroups, setAvailableGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [userCourses, setUserCourses] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [groupMembersMap, setGroupMembersMap] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        loadData();
    }, [token, navigate]);

    async function loadData() {
        try {
            const [coursesRes, myGroupsRes, allGroupsRes] = await Promise.all([
                fetch("http://localhost:5000/api/courses/user/mycourses", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:5000/api/groups/user/mygroups", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:5000/api/groups", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (coursesRes.ok) {
                const courses = await coursesRes.json();
                setUserCourses(courses);
            }

            if (myGroupsRes.ok) {
                const groups = await myGroupsRes.json();
                setMyGroups(groups);
            }

            if (allGroupsRes.ok) {
                const groups = await allGroupsRes.json();
                setAvailableGroups(groups);
            }
        } catch (err) {
            setError("Failed to load groups");
        } finally {
            setLoading(false);
        }
    }

    async function createGroup() {
        if (!newGroupName.trim() || !selectedCourse) {
            setError("Group name and course are required");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newGroupName,
                    course_id: selectedCourse,
                    description: newGroupDescription,
                    max_members: 5,
                }),
            });

            if (response.ok) {
                setNewGroupName("");
                setNewGroupDescription("");
                setSelectedCourse("");
                loadData();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to create group");
            }
        } catch (err) {
            setError("Failed to create group");
        }
    }

    async function joinGroup(groupId) {
        try {
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}/join`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                loadData();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to join group");
            }
        } catch (err) {
            setError("Failed to join group");
        }
>>>>>>> Stashed changes
    }

    async function leaveGroup(groupId) {
        try {
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}/leave`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                loadData();
            } else {
                setError("Failed to leave group");
            }
        } catch (err) {
            setError("Failed to leave group");
        }
    }

    async function toggleGroupMembers(groupId) {
        if (expandedGroupId === groupId) {
            setExpandedGroupId(null);
            return;
        }

        // if members already loaded, just expand
        if (groupMembersMap[groupId]) {
            setExpandedGroupId(groupId);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // data.members is an array of {id,name,email,role}
                setGroupMembersMap(prev => ({ ...prev, [groupId]: data.members }));
                setExpandedGroupId(groupId);
            } else {
                setError("Failed to load members");
            }
        } catch (err) {
            setError("Failed to load members");
        }
    }

    function messageUser(member) {
        // member expected to have id and name
        navigate('/messages', { state: { toUser: { id: member.id, name: member.name } } });
    }

    if (loading) return <div style={{ padding: "20px" }}><p>Loading groups...</p></div>;

    const isUserInGroup = (groupId) => myGroups.some((g) => g.id === groupId);

    return (
<<<<<<< Updated upstream
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
=======
        <div className="groups-container">
            <h1>Study Groups</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="create-group-section">
                <h2>Create New Group</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Group description (optional)"
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="form-input"
                    >
                        <option value="">Select a course</option>
                        {userCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.course_name} ({course.course_code})
                            </option>
                        ))}
                    </select>
                </div>
                {userCourses.length === 0 && (
                    <p className="hint">You need to enroll in courses first. <a href="/profile">Update your profile</a></p>
                )}
                <button onClick={createGroup} className="btn-create">
                    Create Group
                </button>
            </div>

            <div className="groups-grid">
                <div className="section">
                    <h2>Your Groups ({myGroups.length})</h2>
                    {myGroups.length === 0 ? (
                        <p className="no-data">No groups yet. Create or join one!</p>
                    ) : (
                        <div className="group-list">
                            {myGroups.map((group) => (
                                <div key={group.id} className="group-card my-group">
                                    <h3>{group.name}</h3>
                                    <p className="group-description">{group.description}</p>
                                    <p className="group-meta">
                                        Members: {group.members_count}/{group.max_members}
                                    </p>
                                    <div className="group-actions-row">
                                        <button
                                            onClick={() => leaveGroup(group.id)}
                                            className="btn-leave"
                                        >
                                            Leave Group
                                        </button>
                                        <button
                                            className="btn-view-members"
                                            onClick={() => toggleGroupMembers(group.id)}
                                        >
                                            {expandedGroupId === group.id ? 'Hide Members' : 'View Members'}
                                        </button>
                                    </div>

                                    {expandedGroupId === group.id && (
                                        <div className="members-list">
                                            {groupMembersMap[group.id]?.length > 0 ? (
                                                groupMembersMap[group.id].map((m) => (
                                                    <div key={m.id} className="member-item">
                                                        <div className="member-info">
                                                            <span className="member-name">{m.name}</span>
                                                            <span className="member-role">{m.role}</span>
                                                        </div>
                                                        <div className="member-actions">
                                                            <button className="message-btn" onClick={() => messageUser(m)}>
                                                                Message
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-members">No members yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="section">
                    <h2>Available Groups</h2>
                    {availableGroups.length === 0 ? (
                        <p className="no-data">No available groups.</p>
                    ) : (
                        <div className="group-list">
                            {availableGroups
                                .filter((group) => !isUserInGroup(group.id))
                                .map((group) => (
                                    <div key={group.id} className="group-card">
                                        <h3>{group.name}</h3>
                                        <p className="group-description">{group.description}</p>
                                        <p className="group-meta">
                                            Members: {group.members_count}/{group.max_members}
                                        </p>
                                        <div className="group-actions-row">
                                            <button
                                                onClick={() => joinGroup(group.id)}
                                                className="btn-join"
                                                disabled={group.members_count >= group.max_members}
                                            >
                                                {group.members_count >= group.max_members
                                                    ? "Group Full"
                                                    : "Join Group"}
                                            </button>
                                            <button className="btn-view-members" onClick={() => toggleGroupMembers(group.id)}>
                                                {expandedGroupId === group.id ? 'Hide Members' : 'View Members'}
                                            </button>
                                        </div>

                                        {expandedGroupId === group.id && (
                                            <div className="members-list">
                                                {groupMembersMap[group.id]?.length > 0 ? (
                                                    groupMembersMap[group.id].map((m) => (
                                                        <div key={m.id} className="member-item">
                                                            <div className="member-info">
                                                                <span className="member-name">{m.name}</span>
                                                                <span className="member-role">{m.role}</span>
                                                            </div>
                                                            <div className="member-actions">
                                                                <button className="message-btn" onClick={() => messageUser(m)}>
                                                                    Message
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="no-members">No members yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
>>>>>>> Stashed changes
        </div>
    );
}