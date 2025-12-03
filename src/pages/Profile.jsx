import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        major: "",
        study_style: "",
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        loadUserProfile();
        loadCourses();
    }, [token, navigate]);

    async function loadUserProfile() {
        try {
            const response = await fetch("http://localhost:5000/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setFormData({
                    name: data.name,
                    major: data.major || "",
                    study_style: data.study_style || "",
                });
            }
        } catch (err) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }

    async function loadCourses() {
        try {
            const [allRes, myRes] = await Promise.all([
                fetch("http://localhost:5000/api/courses", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:5000/api/courses/user/mycourses", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (allRes.ok) {
                setAllCourses(await allRes.json());
            }
            if (myRes.ok) {
                setCourses(await myRes.json());
            }
        } catch (err) {
            console.error("Failed to load courses", err);
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsEditing(false);
            }
        } catch (err) {
            setError("Failed to update profile");
        }
    }

    async function toggleCourseEnrollment(courseId) {
        const isTaken = courses.some((c) => c.id === courseId);
        const endpoint = isTaken ? "unenroll" : "enroll";

        try {
            const response = await fetch(`http://localhost:5000/api/courses/${courseId}/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                loadCourses();
            }
        } catch (err) {
            setError("Failed to update course enrollment");
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
    }

    if (loading) return <div className="profile-container"><p>Loading...</p></div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!isEditing ? (
                <div className="profile-info">
                    <h2>{user?.name}</h2>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Major:</strong> {user?.major || "Not specified"}</p>
                    <p><strong>Study Style:</strong> {user?.study_style || "Not specified"}</p>
                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Major</label>
                        <input
                            type="text"
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            placeholder="Your major"
                        />
                    </div>
                    <div className="form-group">
                        <label>Study Style</label>
                        <select
                            value={formData.study_style}
                            onChange={(e) => setFormData({ ...formData, study_style: e.target.value })}
                        >
                            <option value="">Select study style</option>
                            <option value="Visual">Visual</option>
                            <option value="Auditory">Auditory</option>
                            <option value="Reading/Writing">Reading/Writing</option>
                            <option value="Kinesthetic">Kinesthetic</option>
                        </select>
                    </div>
                    <button type="submit" className="save-btn">
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div className="courses-section">
                <h3>My Courses</h3>
                <div className="courses-list">
                    {allCourses.map((course) => (
                        <div key={course.id} className="course-item">
                            <div>
                                <p className="course-name">{course.course_name}</p>
                                <p className="course-code">{course.course_code}</p>
                            </div>
                            <button
                                className={
                                    courses.some((c) => c.id === course.id)
                                        ? "btn-enrolled"
                                        : "btn-enroll"
                                }
                                onClick={() => toggleCourseEnrollment(course.id)}
                            >
                                {courses.some((c) => c.id === course.id)
                                    ? "Enrolled"
                                    : "Enroll"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
