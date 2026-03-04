// ThreadDetail.jsx - FIX APPLIED
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./threads.css";
import {
  countReplies,
  formatTimeAgo,
  normalizeRepliesTree,
  normalizeThread
} from "./Helpers";

const renderContentWithMentions = (text) => {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      return (
        <strong key={i} style={{ color: "#1db954" }}>
          {part}
        </strong>
      );
    }
    return part;
  });
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
  editingReply,
  setEditingReply,
  editReplyInput,
  setEditReplyInput,
  handleUpdateReply,
  handleDeleteReply,
  isSubmitting,
  isThreadDeleted,
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="replies-container">
      {replies.map((reply) => {
        const isGhost = !reply.author || reply.author === "Unknown";
        const isAuthor = reply.author === username;
        const isEditing = editingReply === reply.id;

        return (
          <div
            key={reply.id}
            className={`reply-item depth-${depth}`}
            style={{ 
              position: "relative",
              marginLeft: depth === 0 ? "0" : "12px",
              marginTop: "16px"
            }}
          >
            {/* The connector lines */}
            {depth > 0 && (
              <div className="reply-connector-line"></div>
            )}
            {/* Upvote/Downvote for replies */}
            {!isGhost && (
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
            )}

            <div className="reply-header">
              <span className="reply-avatar">{isGhost ? "?" : reply.author.charAt(0)}</span>
              <span className="reply-author" style={{ color: isGhost ? "#666" : "inherit", fontStyle: isGhost ? "italic" : "normal" }}>
                {isGhost ? "[deleted]" : reply.author}
              </span>
              <span className="separator">•</span>
              <span className="reply-time">{formatTimeAgo(reply.createdAt)}</span>
              {reply.updatedAt && !isGhost && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    fontStyle: "italic",
                    marginLeft: "5px",
                  }}
                  title={`Edited at ${new Date(reply.updatedAt).toLocaleString()}`}
                >
                  (edited)
                </span>
              )}
            </div>

            <div className="reply-content">
              {isEditing ? (
                <div style={{ marginTop: "10px" }}>
                  <textarea
                    value={editReplyInput}
                    onChange={(e) => setEditReplyInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#1a1a1a",
                      border: "1px solid #1db954",
                      color: "white",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                    rows={3}
                  />
                  <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleUpdateReply(reply.id)}
                      disabled={!editReplyInput.trim()}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "15px",
                        background: editReplyInput.trim() ? "#1db954" : "#444",
                        color: editReplyInput.trim() ? "black" : "#888",
                        fontWeight: "bold",
                        border: "none",
                        cursor: editReplyInput.trim() ? "pointer" : "not-allowed",
                        fontSize: "0.8rem"
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingReply(null)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "15px",
                        background: "transparent",
                        border: "1px solid #444",
                        color: "#ccc",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ textAlign: "left", color: isGhost ? "#666" : "inherit", fontStyle: isGhost ? "italic" : "normal", whiteSpace: "pre-wrap" }}>
                    {isGhost ? "[This message has been deleted]" : renderContentWithMentions(reply.content)}
                  </p>
                  {reply.updatedAt && !isGhost && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#1db954",
                        opacity: 0.6,
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>✎</span>
                      <span>This reply was edited</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isEditing && (
              <div style={{ marginTop: "10px", display: "flex", gap: "12px", alignItems: "center" }}>
                {depth < maxDepth && !isGhost && !isThreadDeleted && (
                  <button
                    className="reply-btn"
                    onClick={() => {
                      const isClosing = replyingTo === reply.id;
                      setReplyingTo(isClosing ? null : reply.id);
                      if (!isClosing) {
                        handleReplyInputChange(reply.id, `@${reply.author} `);
                      }
                    }}
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
                {isAuthor && !isGhost && (
                  <>
                    <button
                      onClick={() => {
                        setEditingReply(reply.id);
                        setEditReplyInput(reply.content);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#888",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        padding: "0",
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        padding: "0",
                      }}
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            )}

            {depth >= maxDepth && !isGhost && (
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

            {replyingTo === reply.id && depth < maxDepth && !isGhost && (
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
                      disabled={!replyInputs[reply.id]?.trim() || isSubmitting}
                      className="post-reply-btn"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        background: (replyInputs[reply.id]?.trim() && !isSubmitting)
                          ? "#1db954"
                          : "#444",
                        color: (replyInputs[reply.id]?.trim() && !isSubmitting) ? "black" : "#888",
                        fontWeight: "bold",
                        cursor: (replyInputs[reply.id]?.trim() && !isSubmitting)
                          ? "pointer"
                          : "not-allowed",
                      }}
                    >
                      {isSubmitting ? "Posting..." : "Post Reply"}
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
              editingReply={editingReply}
              setEditingReply={setEditingReply}
              editReplyInput={editReplyInput}
              setEditReplyInput={setEditReplyInput}
              handleUpdateReply={handleUpdateReply}
              handleDeleteReply={handleDeleteReply}
              isSubmitting={isSubmitting}
              isThreadDeleted={isThreadDeleted}
            />
          </div>
        );
      })}
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
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyInput, setEditReplyInput] = useState("");
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editThreadInput, setEditThreadInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

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

    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      text: commentInput,
      username: username,
      thread_id: parseInt(threadId),
      parent_reply_id: null,
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
    } finally {
      setIsSubmitting(false);
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

    if (isSubmitting) return;
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/replies/${replyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          text: editReplyInput.trim(),
        }),
      });

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();
        setComments(normalizeRepliesTree(data.replies || []));
        setEditingReply(null);
        setEditReplyInput("");
      } else {
        const errData = await res.json();
        alert(`Failed to update reply: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating reply");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this reply? It will be replaced with a ghost message.",
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/replies/${replyId}?username=${encodeURIComponent(username)}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();
        setComments(normalizeRepliesTree(data.replies || []));
      } else {
        const errData = await res.json();
        alert(`Failed to delete reply: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting reply");
    }
  };

  const handleUpdateThread = async () => {
    if (!editThreadInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/threads/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          text: editThreadInput.trim(),
        }),
      });

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();
        setThread(normalizeThread(data.thread));
        setIsEditingThread(false);
      } else {
        const errData = await res.json();
        alert(`Failed to update thread: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating thread");
    }
  };

  const handleDeleteThread = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteThread = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/threads/${threadId}?username=${encodeURIComponent(username)}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        const refreshRes = await fetch(
          `http://localhost:8000/api/threads/${threadId}/replies`,
        );
        const data = await refreshRes.json();
        setThread(normalizeThread(data.thread));
        setShowDeleteModal(false);
      } else {
        const errData = await res.json();
        alert(`Failed to delete thread: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting thread");
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            style={{
              background: '#1a1a1a', padding: '30px', borderRadius: '15px',
              border: '1px solid #333', maxWidth: '400px', width: '90%',
              textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🗑️</div>
            <h2 style={{ marginBottom: '15px', color: '#e74c3c' }}>Delete Thread?</h2>
            <p style={{ color: '#ccc', marginBottom: '25px', lineHeight: '1.5', fontSize: '1rem' }}>
              Are you sure you want to delete this thread? The title will remain but the content and author will be replaced with a ghost message.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={confirmDeleteThread}
                style={{
                  padding: '10px 25px', borderRadius: '25px', background: '#e74c3c',
                  color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 25px', borderRadius: '25px', background: 'transparent',
                  border: '1px solid #444', color: '#ccc', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            {thread.author === "Unknown" ? "?" : thread.author.charAt(0)}
          </span>
          <span
            className="author-name"
            style={{ 
              fontWeight: "bold", 
              color: thread.author === "Unknown" ? "#666" : "#ccc",
              fontStyle: thread.author === "Unknown" ? "italic" : "normal"
            }}
          >
            {thread.author === "Unknown" ? "[deleted]" : thread.author}
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
          marginBottom: "10px",
          position: "relative",
        }}
      >
        {!isEditingThread && (
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
        )}

        {isEditingThread ? (
          <div style={{ marginTop: "10px" }}>
            <div style={{ 
              marginBottom: "15px", 
              padding: "10px", 
              background: "#121212", 
              borderLeft: "4px solid #1db954",
              fontSize: "0.9rem",
              color: "#aaa"
            }}>
              <span style={{ color: "#1db954", fontWeight: "bold" }}>Notice:</span> It's the platform's etiquette to state which part of the text has been edited. This is not a requirement but it is recommended.
            </div>
            <textarea
              value={editThreadInput}
              onChange={(e) => setEditThreadInput(e.target.value)}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "8px",
                background: "#0a0a0a",
                border: "1px solid #1db954",
                color: "white",
                fontSize: "1rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
                minHeight: "150px"
              }}
            />
            <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
              <button
                onClick={handleUpdateThread}
                disabled={!editThreadInput.trim()}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  background: editThreadInput.trim() ? "#1db954" : "#444",
                  color: editThreadInput.trim() ? "black" : "#888",
                  fontWeight: "bold",
                  border: "none",
                  cursor: editThreadInput.trim() ? "pointer" : "not-allowed"
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditingThread(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  background: "transparent",
                  border: "1px solid #444",
                  color: "#ccc",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                lineHeight: "1.6",
                color: thread.author === "Unknown" ? "#666" : "#ddd",
                textAlign: "left",
                paddingRight: "80px",
                fontStyle: thread.author === "Unknown" ? "italic" : "normal",
                whiteSpace: "pre-wrap"
              }}
            >
              {thread.author === "Unknown" ? "[This message has been deleted]" : renderContentWithMentions(thread.content)}
            </p>
            {thread.updatedAt && thread.author !== "Unknown" && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#1db954",
                  opacity: 0.7,
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>✎</span>
                <span>This thread was edited</span>
              </div>
            )}
          </>
        )}
      </div>

      {thread.author !== "Unknown" && thread.author === username && !isEditingThread && (
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", marginLeft: "5px" }}>
          <button
            onClick={() => {
              setIsEditingThread(true);
              setEditThreadInput(thread.content);
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#888",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 0"
            }}
          >
            <span>✎</span> Edit Thread
          </button>
          <button
            onClick={handleDeleteThread}
            style={{
              background: "transparent",
              border: "none",
              color: "#e74c3c",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 0"
            }}
          >
            <span>🗑</span> Delete Thread
          </button>
        </div>
      )}


      <div className="comments-section">
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "25px",
          borderBottom: "1px solid #333",
          paddingBottom: "15px"
        }}>
          <h3 style={{ margin: 0 }}>
            {totalCommentCount} {totalCommentCount === 1 ? "Comment" : "Comments"}
          </h3>
          <div className="filter-container" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: "500" }}>Sort by</span>
            <div style={{ position: "relative" }}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #444",
                  padding: "6px 28px 6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  appearance: "none",
                  outline: "none"
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
              <span style={{ 
                position: "absolute", 
                right: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                pointerEvents: "none",
                fontSize: "0.7rem",
                color: "#666"
              }}>▼</span>
            </div>
          </div>
        </div>

        {thread.author !== "Unknown" ? (
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
              disabled={!commentInput.trim() || isSubmitting}
              className="post-comment-btn"
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                background: (commentInput.trim() && !isSubmitting) ? "#1db954" : "#444",
                color: (commentInput.trim() && !isSubmitting) ? "black" : "#888",
                fontWeight: "bold",
                cursor: (commentInput.trim() && !isSubmitting) ? "pointer" : "not-allowed",
              }}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
        ) : (
          <div style={{ 
            background: "#1a1a1a", 
            padding: "15px", 
            borderRadius: "12px", 
            border: "1px solid #333",
            color: "#666",
            textAlign: "center",
            marginBottom: "30px",
            fontStyle: "italic"
          }}>
            This thread has been deleted. New comments are disabled.
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            [...comments]
              .sort((a, b) => {
                if (sortBy === "oldest") {
                  return new Date(a.createdAt) - new Date(b.createdAt);
                } else if (sortBy === "recent") {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                } else if (sortBy === "popular") {
                  // Popularity Formula: upvotes + total recursive replies
                  const scoreA = (a.upvotes || 0) + countReplies(a.replies);
                  const scoreB = (b.upvotes || 0) + countReplies(b.replies);
                  if (scoreB !== scoreA) return scoreB - scoreA;
                  return new Date(b.createdAt) - new Date(a.createdAt); // Secondary sort by recent
                }
                return 0;
              })
              .map((comment) => {
              const isGhost = !comment.author || comment.author === "Unknown";
              const isAuthor = comment.author === username;
              const isEditing = editingReply === comment.id;

              return (
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
                  {!isGhost && (
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
                            userVotes[comment.id] === "upvote"
                              ? "#1db954"
                              : "#666",
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
                  )}

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
                      {isGhost ? "?" : comment.author.charAt(0)}
                    </span>
                    <span
                      className="comment-author"
                      style={{
                        fontWeight: "bold",
                        color: isGhost ? "#666" : "inherit",
                        fontStyle: isGhost ? "italic" : "normal",
                      }}
                    >
                      {isGhost ? "[deleted]" : comment.author}
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
                    {comment.updatedAt && !isGhost && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#666",
                          fontStyle: "italic",
                          marginLeft: "5px",
                        }}
                        title={`Edited at ${new Date(
                          comment.updatedAt,
                        ).toLocaleString()}`}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                  <div
                    className="comment-content"
                    style={{ marginBottom: "12px" }}
                  >
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editReplyInput}
                          onChange={(e) => setEditReplyInput(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "8px",
                            background: "#0a0a0a",
                            border: "1px solid #1db954",
                            color: "white",
                            fontSize: "0.95rem",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                          rows={3}
                        />
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdateReply(comment.id)}
                            disabled={!editReplyInput.trim()}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "15px",
                              background: editReplyInput.trim() ? "#1db954" : "#444",
                              color: editReplyInput.trim() ? "black" : "#888",
                              fontWeight: "bold",
                              border: "none",
                              cursor: editReplyInput.trim() ? "pointer" : "not-allowed",
                              fontSize: "0.8rem",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReply(null)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "15px",
                              background: "transparent",
                              border: "1px solid #444",
                              color: "#ccc",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          style={{
                            lineHeight: "1.5",
                            textAlign: "left",
                            color: isGhost ? "#666" : "inherit",
                            fontStyle: isGhost ? "italic" : "normal",
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {isGhost
                            ? "[This message has been deleted]"
                            : renderContentWithMentions(comment.content)}
                        </p>
                        {comment.updatedAt && !isGhost && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#1db954",
                              opacity: 0.6,
                              marginTop: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>✎</span>
                            <span>This comment was edited</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                      }}
                    >
                      {!isGhost && thread.author !== "Unknown" && (
                        <button
                          className="reply-btn"
                          onClick={() => {
                            const isClosing = replyingTo === comment.id;
                            setReplyingTo(isClosing ? null : comment.id);
                            if (!isClosing) {
                              handleReplyInputChange(comment.id, `@${comment.author} `);
                            }
                          }}
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
                      {isAuthor && !isGhost && (
                        <>
                          <button
                            onClick={() => {
                              setEditingReply(comment.id);
                              setEditReplyInput(comment.content);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#888",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              padding: "0",
                            }}
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReply(comment.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#e74c3c",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              padding: "0",
                            }}
                          >
                            🗑 Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {replyingTo === comment.id && !isGhost && (
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
                            disabled={!replyInputs[comment.id]?.trim() || isSubmitting}
                            className="post-reply-btn"
                            style={{
                              padding: "8px 16px",
                              borderRadius: "20px",
                              border: "none",
                              background: (replyInputs[comment.id]?.trim() && !isSubmitting)
                                ? "#1db954"
                                : "#444",
                              color: (replyInputs[comment.id]?.trim() && !isSubmitting)
                                ? "black"
                                : "#888",
                              fontWeight: "bold",
                              cursor: (replyInputs[comment.id]?.trim() && !isSubmitting)
                                ? "pointer"
                                : "not-allowed",
                            }}
                          >
                            {isSubmitting ? "Posting..." : "Post Reply"}
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
                    editingReply={editingReply}
                    setEditingReply={setEditingReply}
                    editReplyInput={editReplyInput}
                    setEditReplyInput={setEditReplyInput}
                    handleUpdateReply={handleUpdateReply}
                    handleDeleteReply={handleDeleteReply}
                    isSubmitting={isSubmitting}
                    isThreadDeleted={thread.author === "Unknown"}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadDetail;