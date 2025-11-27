import { useState } from "react";

export default function Post({ post, onDelete, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isOwner = post.author === "You";

  function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText("");
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-container" />
        <h3 className="author-name" onClick={() => setIsOpen(!isOpen)}>
          {post.author} <span className="dropdown-arrow">▾</span>
        </h3>

        {isOpen && (
          <div className="user-menu-dropdown">
            <button onClick={() => alert("Viewing Profile...")}>
              View Profile
            </button>
            {!isOwner && (
              <>
                <button onClick={() => alert("Connection Request Sent")}>
                  Connect
                </button>
                <button onClick={() => alert("Added to Group")}>
                  Add to Group
                </button>
                <button onClick={() => alert("Direct Message Opened")}>
                  Message
                </button>
              </>
            )}
          </div>
        )}
      </div>


      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button className="like-btn" onClick={() => onLike(post.id)}>
          Like ({post.likes})
        </button>
        
        <button
          className="comment-toggle-btn"
          onClick={() => setShowComments(!showComments)}
        >
          Comments ({post.comments.length})
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
                <strong>{c.author}: </strong> {c.text}
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Comment"
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
