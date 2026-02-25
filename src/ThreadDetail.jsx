// ThreadDetail.jsx - FIX APPLIED
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./threads.css";

// Counts nested replies for a comment
const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0,
  );
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  if (
    typeof dateString === "string" &&
    (dateString.includes("ago") || dateString.includes("Just now"))
  ) {
    return dateString;
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

const normalizeRepliesTree = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    author: item.author ?? "Unknown",
    content: item.content ?? item.text ?? "",
    createdAt: item.createdAt,
    upvotes:
      typeof item.upvotes === "number"
        ? item.upvotes
        : (item.likes || 0) - (item.dislikes || 0),
    replies: normalizeRepliesTree(item.replies || []),
  }));
};

const normalizeThread = (thread) => {
  if (!thread) return null;

  return {
    id: thread.id,
    title: thread.title ?? "",
    content: thread.text ?? "",
    author: thread.author ?? "Unknown",
    avatar: thread.avatar ?? null,
    createdAt: thread.createdAt,
    sceneId: thread.sceneId,
    upvotes:
      typeof thread.upvotes === "number"
        ? thread.upvotes
        : (thread.likes || 0) - (thread.dislikes || 0),
  };
};

const RenderReplies = ({
  replies,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyInputs,
  handleReplyInputChange,
  handlePostReply,
  handleCancelReply,
  handleUpvote,
  handleDownvote,
  username,
  maxDepth = 3,
  userVotes,
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="replies-container">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className="reply-item"
          style={{ position: "relative" }}
        >
          {/* Upvote/Downvote for replies */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "flex",
              gap: "3px",
              alignItems: "center",
              background: "#0a0a0a",
              padding: "4px 8px",
              borderRadius: "20px",
              border: "1px solid #333",
            }}
          >
            <button
              onClick={() => handleUpvote(reply.id, true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: userVotes[reply.id] === "upvote" ? "#1db954" : "#666",
                padding: "0",
                lineHeight: "1",
              }}
              title="Upvote"
            >
              ⬆
            </button>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "0.8rem",
                color:
                  (reply.upvotes || 0) > 0
                    ? "#1db954"
                    : (reply.upvotes || 0) < 0
                      ? "#e74c3c"
                      : "#888",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {reply.upvotes || 0}
            </span>
            <button
              onClick={() => handleDownvote(reply.id, true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: userVotes[reply.id] === "downvote" ? "#e74c3c" : "#666",
                padding: "0",
                lineHeight: "1",
              }}
              title="Downvote"
            >
              ⬇
            </button>
          </div>

          <div className="reply-header">
            <span className="reply-avatar">{reply.author.charAt(0)}</span>
            <span className="reply-author">{reply.author}</span>
            <span className="separator">•</span>
            <span className="reply-time">{formatTimeAgo(reply.createdAt)}</span>
          </div>

          <div className="reply-content">
            <p style={{ textAlign: "left" }}>{reply.content}</p>
          </div>

          <div style={{ marginTop: "10px" }}>
            {depth < maxDepth && (
              <button
                className="reply-btn"
                onClick={() =>
                  setReplyingTo(replyingTo === reply.id ? null : reply.id)
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  padding: "0",
                }}
              >
                💬 Reply
              </button>
            )}
          </div>

          {depth >= maxDepth && (
            <span
              style={{
                color: "#666",
                fontSize: "0.85rem",
                display: "block",
                marginTop: "8px",
              }}
            >
              Maximum reply depth reached
            </span>
          )}

          {replyingTo === reply.id && depth < maxDepth && (
            <div
              className="reply-input-container"
              style={{ marginTop: "15px" }}
            >
              <div className="user-avatar small">{username.charAt(0)}</div>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <textarea
                  value={replyInputs[reply.id] || ""}
                  onChange={(e) =>
                    handleReplyInputChange(reply.id, e.target.value)
                  }
                  placeholder={`Reply to ${reply.author}...`}
                  className="reply-textarea"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#1a1a1a",
                    border: "1px solid #444",
                    color: "white",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  className="reply-actions"
                  style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                >
                  <button
                    onClick={() => handlePostReply(reply.id, depth)}
                    disabled={!replyInputs[reply.id]?.trim()}
                    className="post-reply-btn"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "none",
                      background: replyInputs[reply.id]?.trim()
                        ? "#1db954"
                        : "#444",
                      color: replyInputs[reply.id]?.trim() ? "black" : "#888",
                      fontWeight: "bold",
                      cursor: replyInputs[reply.id]?.trim()
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => handleCancelReply(reply.id)}
                    className="cancel-btn"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid #444",
                      background: "transparent",
                      color: "#ccc",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
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
            handleUpvote={handleUpvote}
            handleDownvote={handleDownvote}
            username={username}
            maxDepth={maxDepth}
            userVotes={userVotes}
          />
        </div>
      ))}
    </div>
  );
};

function ThreadDetail() {
  const MAX_DEPTH = 3;
  const navigate = useNavigate();
  const { sceneId, threadId } = useParams();
  const [username, setUsername] = useState("User");
  const [scene, setScene] = useState(null);
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);

    fetch(`http://localhost:8000/api/threads/${threadId}/replies`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Threads API failed (${res.status}). Response: ${text}`,
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.thread) {
          console.error("Expected { thread, replies } but got:", data);
          throw new Error("Missing `thread` in /api/threads response");
        }

        setThread(normalizeThread(data.thread));
        setComments(normalizeRepliesTree(data.replies || []));

        if (!data.thread.sceneId) {
          console.error("Thread is missing sceneId:", data.thread);
          throw new Error("Missing `sceneId` on thread");
        }

        return fetch(
          `http://localhost:8000/api/scenes/${data.thread.sceneId}`,
        );
      })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Scenes API failed (${res.status}). Response: ${text}`,
          );
        }
        return res.json();
      })
      .then((sceneData) => {
        setScene(sceneData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching thread:", err);
        setIsLoading(false);
      });
  }, [threadId]);

  const totalCommentCount = comments.reduce((total, comment) => {
    return total + 1 + countReplies(comment.replies || []);
  }, 0);

  // --- FIXED FUNCTION: POST COMMENT ---
  const handlePostComment = async () => {
    if (!commentInput.trim()) return;

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to comment");
      navigate("/login");
      return;
    }

    // UPDATED PAYLOAD to match schema.py (snake_case)
    const payload = {
      text: commentInput,           // was content
      username: username,           // was author
      thread_id: parseInt(threadId), // was threadId
      parent_reply_id: null,        // was parentCommentId
    };

    try {
      const res = await fetch("http://localhost:8000/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();
        setThread(normalizeThread(data.thread));
        setComments(normalizeRepliesTree(data.replies || []));
        setCommentInput("");
      } else {
        const errData = await res.json();
        alert(`Failed to post comment: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error posting comment");
    }
  };

  // --- FIXED FUNCTION: POST REPLY ---
  const handlePostReply = async (parentId, currentDepth) => {
    if (!replyInputs[parentId]?.trim()) return;
    if (currentDepth >= MAX_DEPTH) return;

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to reply");
      navigate("/login");
      return;
    }

    // UPDATED PAYLOAD to match schema.py (snake_case)
    const payload = {
      text: replyInputs[parentId],  // was content
      username: username,           // was author
      thread_id: parseInt(threadId), // was threadId
      parent_reply_id: parentId,    // was parentCommentId
    };

    try {
      const res = await fetch("http://localhost:8000/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();

        setThread(normalizeThread(data.thread));
        setComments(normalizeRepliesTree(data.replies));
        setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
        setReplyingTo(null);
      } else {
        const errData = await res.json();
        alert(`Failed to post reply: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error posting reply");
    }
  };

  const handleReplyInputChange = (parentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [parentId]: value }));
  };

  const handleCancelReply = (parentId) => {
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
    setReplyingTo(null);
  };

  const handleUpvote = (commentId, isReply = false) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to vote");
      navigate("/login");
      return;
    }
    setUserVotes((prev) => {
      const currentVote = prev[commentId];
      if (currentVote === "upvote") {
        const newVotes = { ...prev };
        delete newVotes[commentId];
        return newVotes;
      } else {
        return { ...prev, [commentId]: "upvote" };
      }
    });
  };

  const handleDownvote = (commentId, isReply = false) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to vote");
      navigate("/login");
      return;
    }
    setUserVotes((prev) => {
      const currentVote = prev[commentId];
      if (currentVote === "downvote") {
        const newVotes = { ...prev };
        delete newVotes[commentId];
        return newVotes;
      } else {
        return { ...prev, [commentId]: "downvote" };
      }
    });
  };

  if (isLoading) {
    return (
      <div
        className="main-content"
        style={{
          padding: "20px",
          color: "white",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <p>Loading thread...</p>
      </div>
    );
  }

  if (!thread || !scene) {
    return (
      <div
        className="main-content"
        style={{
          padding: "20px",
          color: "white",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <p>Thread not found</p>
        <button
          onClick={() => navigate("/scenes")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "20px",
            background: "#1db954",
            color: "black",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Scenes
        </button>
      </div>
    );
  }

  return (
    <div
      className="main-content"
      style={{
        padding: "20px",
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate(`/scene/${sceneId}`)}
        className="back-button"
        style={{
          background: "transparent",
          border: "1px solid #444",
          color: "#ccc",
          padding: "8px 16px",
          borderRadius: "20px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back to {scene.name}
      </button>

      <div className="thread-header" style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
          {thread.title}
        </h1>
        <div
          className="thread-meta"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#888",
          }}
        >
          <span
            className="avatar"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {thread.author.charAt(0)}
          </span>
          <span
            className="author-name"
            style={{ fontWeight: "bold", color: "#ccc" }}
          >
            {thread.author}
          </span>
          <span className="separator">•</span>
          <span className="time">{formatTimeAgo(thread.createdAt)}</span>
        </div>
      </div>

      <div
        className="original-post"
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            display: "flex",
            gap: "4px",
            alignItems: "center",
            background: "#0a0a0a",
            padding: "6px 10px",
            borderRadius: "20px",
            border: "1px solid #333",
          }}
        >
          <button
            onClick={() => handleUpvote(thread.id, false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              color: userVotes[thread.id] === "upvote" ? "#1db954" : "#666",
              padding: "0",
              lineHeight: "1",
            }}
            title="Upvote"
          >
            ⬆
          </button>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              color:
                (thread.upvotes || 0) > 0
                  ? "#1db954"
                  : (thread.upvotes || 0) < 0
                    ? "#e74c3c"
                    : "#888",
              minWidth: "25px",
              textAlign: "center",
            }}
          >
            {thread.upvotes || 0}
          </span>
          <button
            onClick={() => handleDownvote(thread.id, false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              color:
                userVotes[thread.id] === "downvote" ? "#e74c3c" : "#666",
              padding: "0",
              lineHeight: "1",
            }}
            title="Downvote"
          >
            ⬇
          </button>
        </div>

        <p
          style={{
            lineHeight: "1.6",
            color: "#ddd",
            textAlign: "left",
            paddingRight: "80px",
          }}
        >
          {thread.content}
        </p>
      </div>

      <div className="comments-section">
        <h3 style={{ marginBottom: "20px" }}>
          {totalCommentCount} {totalCommentCount === 1 ? "Comment" : "Comments"}
        </h3>

        <div
          className="comment-input-container"
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "30px",
            background: "#1a1a1a",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #333",
          }}
        >
          <div
            className="user-avatar"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }}
          >
            {username.charAt(0)}
          </div>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="comment-textarea"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#0a0a0a",
                border: "1px solid #444",
                color: "white",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                minHeight: "80px",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!commentInput.trim()}
              className="post-comment-btn"
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                background: commentInput.trim() ? "#1db954" : "#444",
                color: commentInput.trim() ? "black" : "#888",
                fontWeight: "bold",
                cursor: commentInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              Post Comment
            </button>
          </div>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="comment-item"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "15px",
                  position: "relative",
                }}
              >
                {/* Upvote/Downvote for comments */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    background: "#0a0a0a",
                    padding: "5px 8px",
                    borderRadius: "20px",
                    border: "1px solid #333",
                  }}
                >
                  <button
                    onClick={() => handleUpvote(comment.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color:
                        userVotes[comment.id] === "upvote" ? "#1db954" : "#666",
                      padding: "0",
                      lineHeight: "1",
                    }}
                    title="Upvote"
                  >
                    ⬆
                  </button>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      color:
                        (comment.upvotes || 0) > 0
                          ? "#1db954"
                          : (comment.upvotes || 0) < 0
                            ? "#e74c3c"
                            : "#888",
                      minWidth: "22px",
                      textAlign: "center",
                    }}
                  >
                    {comment.upvotes || 0}
                  </span>
                  <button
                    onClick={() => handleDownvote(comment.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color:
                        userVotes[comment.id] === "downvote"
                          ? "#e74c3c"
                          : "#666",
                      padding: "0",
                      lineHeight: "1",
                    }}
                    title="Downvote"
                  >
                    ⬇
                  </button>
                </div>

                <div
                  className="comment-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                    paddingRight: "80px",
                  }}
                >
                  <span
                    className="comment-avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {comment.author.charAt(0)}
                  </span>
                  <span
                    className="comment-author"
                    style={{ fontWeight: "bold" }}
                  >
                    {comment.author}
                  </span>
                  <span className="separator" style={{ color: "#666" }}>
                    •
                  </span>
                  <span
                    className="comment-time"
                    style={{ color: "#888", fontSize: "0.9rem" }}
                  >
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <div
                  className="comment-content"
                  style={{ marginBottom: "12px" }}
                >
                  <p style={{ lineHeight: "1.5", textAlign: "left" }}>
                    {comment.content}
                  </p>
                </div>

                <button
                  className="reply-btn"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    padding: "0",
                  }}
                >
                  💬 Reply
                </button>

                {replyingTo === comment.id && (
                  <div
                    className="reply-input-container"
                    style={{ marginTop: "15px", display: "flex", gap: "10px" }}
                  >
                    <div
                      className="user-avatar small"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#555",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {username.charAt(0)}
                    </div>
                    <div className="input-wrapper" style={{ flex: 1 }}>
                      <textarea
                        value={replyInputs[comment.id] || ""}
                        onChange={(e) =>
                          handleReplyInputChange(comment.id, e.target.value)
                        }
                        placeholder={`Reply to ${comment.author}...`}
                        className="reply-textarea"
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#0a0a0a",
                          border: "1px solid #444",
                          color: "white",
                          fontSize: "0.95rem",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                      <div
                        className="reply-actions"
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => handlePostReply(comment.id, 1)}
                          disabled={!replyInputs[comment.id]?.trim()}
                          className="post-reply-btn"
                          style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "none",
                            background: replyInputs[comment.id]?.trim()
                              ? "#1db954"
                              : "#444",
                            color: replyInputs[comment.id]?.trim()
                              ? "black"
                              : "#888",
                            fontWeight: "bold",
                            cursor: replyInputs[comment.id]?.trim()
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => handleCancelReply(comment.id)}
                          className="cancel-btn"
                          style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "1px solid #444",
                            background: "transparent",
                            color: "#ccc",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <RenderReplies
                  replies={comment.replies}
                  depth={1}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyInputs={replyInputs}
                  handleReplyInputChange={handleReplyInputChange}
                  handlePostReply={handlePostReply}
                  handleCancelReply={handleCancelReply}
                  handleUpvote={handleUpvote}
                  handleDownvote={handleDownvote}
                  username={username}
                  userVotes={userVotes}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadDetail;