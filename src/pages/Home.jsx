import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "../components/CreatePosts";
import Post from "../components/Post";
import "../styles/Home.css";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const onStorage = () => setLoggedIn(Boolean(localStorage.getItem("token")));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (loggedIn) {
            loadPosts();
        }
    }, [loggedIn]);

    async function loadPosts() {
        try {
            const response = await fetch("http://localhost:5000/api/posts");
            if (response.ok) {
                const data = await response.json();
                setAllPosts(data.posts);
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    }

    async function searchPosts(query) {
        setSearchQuery(query);
        if (!query.trim()) {
            setPosts(allPosts);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/posts/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Error searching posts:", error);
        }
    }

    async function addPost(post){
        const newPosts = [post, ...posts];
        setPosts(newPosts);
        setAllPosts(newPosts);
    }

    async function deletePost(postId){
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                const filtered = posts.filter(post => post.id !== postId);
                setPosts(filtered);
                setAllPosts(filtered);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }

    async function likePost(postId){
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: "POST",
                headers: {"Content-Type": "application/json"}
            });
            if (response.ok) {
                const updatedPost = await response.json();
                const updated = posts.map(post => post.id === postId ? updatedPost : post);
                setPosts(updated);
                setAllPosts(updated);
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    }

    async function addComment(postId, commentText){
        const user = JSON.parse(localStorage.getItem("user") || '{"name":"You"}');
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    author: user.name,
                    text: commentText
                })
            });
            if (response.ok) {
                const updatedPost = await response.json();
                const updated = posts.map(post => post.id === postId ? updatedPost : post);
                setPosts(updated);
                setAllPosts(updated);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }

    return(
        <div className="home-container">
            <div className="home-header">
                <div className="header-content">
                    <h1>Study Group Feed</h1>
                    <p>Connect with study partners, share posts, and find study groups</p>
                </div>
                {!loggedIn && (
                    <div className="auth-buttons">
                        <button 
                            className="btn-signup"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                        <button 
                            className="btn-login"
                            onClick={() => navigate("/login")}
                        >
                            Log In
                        </button>
                    </div>
                )}
            </div>

            {loggedIn && (
                <div className="posts-section">
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="🔍 Search posts by keyword..." 
                            value={searchQuery}
                            onChange={(e) => searchPosts(e.target.value)}
                            className="post-search"
                        />
                    </div>
                    <CreatePost onPost={addPost}/>
                    <div className="posts-list">
                        {posts.length === 0 ? (
                            <div className="no-posts">
                                <p>No posts yet. Be the first to share!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <Post
                                    key = {post.id}
                                    post = {post}
                                    onDelete = {deletePost}
                                    onLike = {likePost}
                                    onComment = {addComment}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {!loggedIn && (
                <div className="welcome-section">
                    <div className="welcome-card">
                        <h2>Welcome to Study Group Matcher</h2>
                        <p>Find the perfect study partners for your courses. Connect with students who share your classes and study style.</p>
                        <div className="features">
                            <div className="feature">
                                <span className="feature-icon">🎯</span>
                                <h3>Smart Matching</h3>
                                <p>Find study partners based on shared courses and study preferences</p>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">👥</span>
                                <h3>Study Groups</h3>
                                <p>Create and join study groups for your courses</p>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">💬</span>
                                <h3>Direct Messaging</h3>
                                <p>Connect with other students and discuss study topics</p>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📚</span>
                                <h3>Course-Based</h3>
                                <p>Organize study groups by your enrolled courses</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
