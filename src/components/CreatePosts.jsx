import {useState} from "react";

export default function CreatePost({onPost}){
    const [text, setText] = useState("");

    function Submit(e){
        e.preventDefault();
        if (!text.trim()) return;
        onPost(text);
        setText("");
    }

    return (
        <form onSubmit = {Submit}>
            <textarea 
                placeholder = "Write your post" 
                value = {text} 
                onChange = {(e) => setText(e.target.value)}
            />
            <button type = "submit">Post</button>
        </form>
    );
}