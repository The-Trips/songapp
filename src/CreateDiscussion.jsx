// src/CreateDiscussion.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CreateDiscussion({ isAuthenticated }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Community ID
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);
  }, [navigate, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem("app_username");
    if (!username) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          text: content,
          username,
          community_id: id,
        }),
      });
      if (res.ok) {
        navigate(`/community/${id}`);
      } else {
        alert("Failed to post discussion");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Start a Discussion</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "#2a2a2a",
            border: "1px solid #444",
            color: "white",
          }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Thoughts..."
          required
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "#2a2a2a",
            border: "1px solid #444",
            color: "white",
            height: "150px",
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "12px 30px",
            borderRadius: "25px",
            background: "#1db954",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Posting..." : "Post Discussion"}
        </button>
      </form>
    </div>
  );
}

export default CreateDiscussion;
