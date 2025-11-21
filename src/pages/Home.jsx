import {useState, useEffect} from "react";
import CreatePost from "../components/CreatePosts";
import Post from "../components/Post";

export default function Home() {
    const [posts, setPosts] = useState([
        { id: 1, author: "FirstName LastName", content: "Message"}
    ]);

    const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));

    useEffect(() => {
        const onStorage = () => setLoggedIn(Boolean(localStorage.getItem("token")));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    function addPost(text){
        const newPost = {
            id: posts.length +1, author: "You", content: text
        };
        setPosts([newPost, ...posts]);
    }

    return(
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Feed</h1>
                <div>
                    {!loggedIn ? (
                        <>
                            <a href="/signup" style={{marginRight: 8, padding: '8px 12px', background: '#0b5fff', color: 'white', textDecoration: 'none', borderRadius: 4}}>Sign Up</a>
                            <a href="/login" style={{padding: '8px 12px', background: '#00a86b', color: 'white', textDecoration: 'none', borderRadius: 4}}>Log In</a>
                        </>
                    ) : (
                        <a href="/profile" style={{padding: '8px 12px', background: '#f59e0b', color: 'white', textDecoration: 'none', borderRadius: 4}}>Profile</a>
                    )}
                </div>
            </div>

            <CreatePost onPost = {addPost}/>
            {posts.map((post) => (
                <Post key = {post.id} post={post}/>
            ))}
        </div>
    );
}
