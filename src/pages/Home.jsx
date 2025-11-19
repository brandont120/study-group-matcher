import {useState} from "react";
import CreatePost from "../components/CreatePosts";
import Post from "../components/Post";

export default function Home() {
    const [posts, setPosts] = useState([
        { id: 1, author: "FirstName LastName", content: "Message"}
    ]);

    function addPost(text){
        const newPost = {
            id: posts.length +1, author: "You", content: text
        };
        setPosts([newPost, ...posts]);
    }

    return(
        <div>
            <h1>Feed</h1>
            <CreatePost onPost = {addPost}/>
            {posts.map((post) => (
                <Post key = {post.id} post={post}/>
            ))}
        </div>
    );
}
