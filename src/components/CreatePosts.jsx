import {useState} from "react";

export default function CreatePost({onPost}){
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async function Submit(e){
        e.preventDefault();
        if (!text.trim()) return;
        
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || '{"name":"You"}');
        
        try {
            const response = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    author: user.name,
                    author_id: user.id,
                    content: text,
                    image: image
                })
            });
            if (response.ok) {
                const post = await response.json();
                onPost(post);
                setText("");
                setImage(null);
                setImagePreview(null);
            }
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={Submit} className="create-post-form">
            <textarea 
                placeholder="Share something with your study group..." 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                className="post-textarea"
                rows="4"
            />
            {imagePreview && (
                <div className="image-preview">
                    <img src={imagePreview} alt="preview" />
                    <button type="button" onClick={() => {setImage(null); setImagePreview(null);}} className="remove-image">✕</button>
                </div>
            )}
            <div className="post-controls">
                <label className="image-upload-btn">
                    📸 Add Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}} />
                </label>
                <button type="submit" disabled={loading || !text.trim()}>
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </form>
    );
}
