import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Post({ post, onDelete, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const isOwner = post.author === localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).name : null;

  function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText("");
  }

  function handleLike() {
    if (!liked) {
      setLiked(true);
      onLike(post.id);
    }
  }

  function handleMessage() {
    // prefer using author id when available
    const toUser = post.author_id ? { id: post.author_id, name: post.author } : { name: post.author };
    navigate("/messages", { state: { toUser } });
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-container" />
        <div className="author-info">
          <h3 className="author-name" onClick={() => setIsOpen(!isOpen)}>
            {post.author} <span className="dropdown-arrow">▾</span>
          </h3>
          <span className="post-time">{new Date(post.timestamp).toLocaleDateString()}</span>
        </div>

        {isOpen && (
          <div className="user-menu-dropdown">
            <button onClick={() => alert("Viewing " + post.author + "'s Profile")}>
              View Profile
            </button>
            {isOwner !== post.author && (
              <>
                <button onClick={() => alert("Connection Request Sent")}>
                  Connect
                </button>
                <button onClick={handleMessage}>
                  Message
                </button>
              </>
            )}
          </div>
        )}
      </div>

<<<<<<< Updated upstream
=======
      {isOwner === post.author && (
        <button className="delete-btn" onClick={() => onDelete(post.id)}>
          Delete
        </button>
      )}
>>>>>>> Stashed changes

      <p className="post-content">{post.content}</p>

      {post.image && (
        <img src={post.image} alt="post" className="post-image" />
      )}

      <div className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          ❤️ {post.likes}
        </button>
        
        <button
          className="comment-toggle-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comments.length}
        </button>
        <button className="message-btn" onClick={handleMessage}>
          📧 Message
        </button>

        {isOwner && (
        <button className="delete-btn" onClick={() => onDelete(post.id)}>
          Delete
        </button>
      )}
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.map((c) => (
              <div key={c.id} className="single-comment">
                <strong>{c.author}</strong>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit" className="reply-btn">
              Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

