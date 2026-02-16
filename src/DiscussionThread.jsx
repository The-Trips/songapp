import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./discussions.css";

// Recursive Reply Component
const RenderReplies = ({
  replies,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyInputs,
  handleReplyInputChange,
  handlePostReply,
  handleCancelReply,
  username,
  maxDepth = 3,
}) => {
  if (!replies || replies.length === 0) return null;
  return (
    <div className="replies-container">
      {replies.map((reply) => (
        <div key={reply.id} className="reply-item">
          <div className="reply-header">
            <span className="reply-avatar">{reply.author.charAt(0)}</span>
            <span className="reply-author">{reply.author}</span>
            <span className="reply-time">{reply.createdAt}</span>
          </div>
          <div className="reply-content">
            <p>{reply.content}</p>
          </div>

          {depth < maxDepth && (
            <button
              className="reply-btn"
              onClick={() =>
                setReplyingTo(replyingTo === reply.id ? null : reply.id)
              }
            >
              💬 Reply
            </button>
          )}

          {replyingTo === reply.id && (
            <div className="reply-input-container">
              <textarea
                value={replyInputs[reply.id] || ""}
                onChange={(e) =>
                  handleReplyInputChange(reply.id, e.target.value)
                }
                className="reply-textarea"
                rows={3}
              />
              <div className="reply-actions">
                <button
                  onClick={() => handlePostReply(reply.id, depth)}
                  className="post-reply-btn"
                >
                  Post
                </button>
                <button
                  onClick={() => handleCancelReply(reply.id)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <RenderReplies
            replies={reply.replies || []}
            depth={depth + 1}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyInputs={replyInputs}
            handleReplyInputChange={handleReplyInputChange}
            handlePostReply={handlePostReply}
            handleCancelReply={handleCancelReply}
            username={username}
            maxDepth={maxDepth}
          />
        </div>
      ))}
    </div>
  );
};

function DiscussionThread({ isAuthenticated }) {
  const navigate = useNavigate();
  const { id, discussionId } = useParams(); // using 'id' for albumId
  const [username, setUsername] = useState("User");
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);

    const savedData = localStorage.getItem(`discussion_${discussionId}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setDiscussion(data.discussion);
      setComments(data.comments || []);
    }
  }, [discussionId]);

  const saveToLocalStorage = (updatedComments) => {
    localStorage.setItem(
      `discussion_${discussionId}`,
      JSON.stringify({ discussion, comments: updatedComments }),
    );
  };

  const handlePostComment = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      author: username,
      content: commentInput,
      createdAt: "Just now",
      replies: [],
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveToLocalStorage(updatedComments);
    setCommentInput("");
  };

  const addReplyToComment = (comments, targetId, newReply) => {
    return comments.map((comment) => {
      if (comment.id === targetId)
        return { ...comment, replies: [...(comment.replies || []), newReply] };
      else if (comment.replies)
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, targetId, newReply),
        };
      return comment;
    });
  };

  const handlePostReply = (parentId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!replyInputs[parentId]?.trim()) return;
    const newReply = {
      id: Date.now(),
      author: username,
      content: replyInputs[parentId],
      createdAt: "Just now",
      replies: [],
    };
    const updatedComments = addReplyToComment(comments, parentId, newReply);
    setComments(updatedComments);
    saveToLocalStorage(updatedComments);
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
    setReplyingTo(null);
  };

  if (!discussion)
    return <div style={{ padding: "40px", color: "white" }}>Loading...</div>;

  return (
    <div
      style={{
        padding: "40px",
        color: "white",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate(`/album/${id}/discussions`)}
        className="back-button"
      >
        ← Back to Discussions
      </button>

      <div className="thread-header">
        <h1>{discussion.title}</h1>
        <div className="thread-meta">
          <span className="author-name">{discussion.author}</span> •{" "}
          <span className="time">{discussion.createdAt}</span>
        </div>
      </div>

      <div className="original-post">
        <p>{discussion.content}</p>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>

        {isAuthenticated ? (
          <div className="comment-input-container">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="comment-textarea"
            />
            <button onClick={handlePostComment} className="post-comment-btn">
              Post Comment
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #333",
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#aaa", marginBottom: "15px" }}>
              Found something to say?
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#770505",
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Log in to Reply
            </button>
          </div>
        )}

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-avatar">
                  {comment.author.charAt(0)}
                </span>
                <span className="comment-author">{comment.author}</span>
              </div>
              <p className="comment-content">{comment.content}</p>

              {isAuthenticated && (
                <button
                  className="reply-btn"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  💬 Reply
                </button>
              )}

              {replyingTo === comment.id && isAuthenticated && (
                <div className="reply-input-container">
                  <textarea
                    value={replyInputs[comment.id] || ""}
                    onChange={(e) =>
                      setReplyInputs({
                        ...replyInputs,
                        [comment.id]: e.target.value,
                      })
                    }
                    className="reply-textarea"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    className="post-reply-btn"
                  >
                    Post
                  </button>
                </div>
              )}

              <RenderReplies
                replies={comment.replies}
                depth={1}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyInputs={replyInputs}
                handleReplyInputChange={(id, val) =>
                  setReplyInputs({ ...replyInputs, [id]: val })
                }
                handlePostReply={handlePostReply}
                handleCancelReply={() => setReplyingTo(null)}
                username={username}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiscussionThread;
