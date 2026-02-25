// src/SceneDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./threads.css";

const API_URL = "http://localhost:8000";

function SceneDetail() {
  const navigate = useNavigate();
  const params = useParams();

  // supports both: { sceneId } and { id }
  const sceneIdRaw = params.sceneId ?? params.id;
  const sceneIdNum = Number(sceneIdRaw);

  const [username, setUsername] = useState("User");
  const [scene, setScene] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'popular' | 'oldest'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);

    // joined check (localStorage)
    const savedJoined = localStorage.getItem(
      `joined_scenes_${storedUser || "User"}`,
    );
    if (savedJoined) {
      const joinedList = JSON.parse(savedJoined);
      setIsJoined(joinedList.includes(sceneIdNum));
    } else {
      setIsJoined(false);
    }

    fetchSceneData();
  }, [sceneIdRaw]);

  const normalizeScene = (data) => {
    return {
      id: data.scene_id,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      isOfficial: Boolean(data.isOfficial ?? data.official ?? false),
      members:
        data.members ??
        data.memberCount ??
        data.followers ??
        data.followersCount ??
        0,
      createdBy: data.owner,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      albumId: data.albumId ?? null,
    };
  };

  const normalizeThread = (t) => {
    return {
      id: t.id ?? t.t_id ?? t._id,
      sceneId: sceneIdNum,
      title: t.title ?? "(No title)",
      author: t.author ?? t.username ?? "Unknown",
      content: t.content ?? t.text ?? "",
      upvotes: t.upvotes ?? t.likes ?? 0,
      commentCount: t.commentCount ?? t.comments ?? 0,
      createdAt: t.createdAt ?? t.date_created ?? t.date ?? null,
      isPinned: Boolean(t.isPinned ?? false),
    };
  };

  const fetchSceneData = async () => {
    setIsLoading(true);

    try {
      let sceneRes = await fetch(`${API_URL}/api/scenes/${sceneIdRaw}`);
      if (!sceneRes.ok) {
        setScene(null);
        setThreads([]);
        setIsLoading(false);
        return;
      }

      const data = await sceneRes.json();
      setScene(normalizeScene(data));

      const threadsArr = data?.threads ?? [];
      setThreads(
        Array.isArray(threadsArr) ? threadsArr.map(normalizeThread) : [],
      );
    } catch (err) {
      console.error("Error fetching scene data:", err);
      setScene(null);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinToggle = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to join communities");
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("app_username") || "User";
    const savedJoined =
      localStorage.getItem(`joined_scenes_${storedUser}`) || "[]";
    let joinedList = JSON.parse(savedJoined);

    if (isJoined) {
      joinedList = joinedList.filter((id) => id !== sceneIdNum);
      setScene((prev) =>
        prev
          ? { ...prev, members: Math.max(0, (prev.members || 0) - 1) }
          : prev,
      );
    } else {
      joinedList = Array.from(new Set([...joinedList, sceneIdNum]));
      setScene((prev) =>
        prev ? { ...prev, members: (prev.members || 0) + 1 } : prev,
      );
    }

    localStorage.setItem(
      `joined_scenes_${storedUser}`,
      JSON.stringify(joinedList),
    );
    setIsJoined((v) => !v);

    // TODO: later persist join/leave to backend
  };

  const handleCreateThread = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to start a thread");
      navigate("/login");
      return;
    }
    navigate(`/scene/${sceneIdRaw}/create-thread`);
  };

  const handleThreadClick = (threadId) => {
    navigate(`/scene/${sceneIdRaw}/thread/${threadId}`);
  };

  const handleGoToAlbum = () => {
    if (scene?.albumId) navigate(`/album/${scene.albumId}`);
  };

  const sortedThreads = useMemo(() => {
    const arr = [...threads];
    if (sortBy === "popular")
      return arr.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    if (sortBy === "oldest")
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [threads, sortBy]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const now = new Date();
    const diffMs = now - date;

    // future dates (bad clock/data) fallback
    if (diffMs < 0) return date.toLocaleDateString();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    // Rough month/year fallbacks
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  };

  if (isLoading) {
    return (
      <div
        className="main-content"
        style={{
          padding: "20px",
          color: "white",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <p>Loading scene...</p>
      </div>
    );
  }

  if (!scene) {
    return (
      <div
        className="main-content"
        style={{
          padding: "20px",
          color: "white",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h2>Scene not found</h2>
        <button
          onClick={() => navigate("/scenes")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#1db954",
            border: "none",
            borderRadius: "20px",
            color: "black",
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
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/communities")}
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
        ← Back to Scenes
      </button>

      {/* Scene Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #121212 100%)",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "30px",
          marginBottom: "30px",
          position: "relative",
        }}
      >
        {/* Official Badge */}
        {scene.isOfficial && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#1db954",
              color: "black",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "bold",
            }}
          >
            ✓ OFFICIAL
          </div>
        )}

        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
          {/* Scene Image */}
          <div
            style={{
              width: "150px",
              height: "150px",
              minWidth: "150px",
              background: scene.imageUrl
                ? `url(${scene.imageUrl}) center/cover`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />

          {/* Scene Info */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              {scene.name}
            </h1>
            <p
              style={{
                color: "#aaa",
                fontSize: "1rem",
                marginBottom: "20px",
                lineHeight: "1.5",
                textAlign: "left",
              }}
            >
              {scene.description}
            </p>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "30px",
                marginBottom: "20px",
                fontSize: "0.95rem",
                color: "#888",
                flexWrap: "wrap",
              }}
            >
              <span>
                👥 {(scene.members ?? 0).toLocaleString()} members
              </span>
              <span>{threads.length} threads</span>

              {/* NEW */}
              <span>Created {formatTimeAgo(scene.createdAt)}</span>

              <span>Created by {scene.createdBy || "Unknown"}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <button
                onClick={handleJoinToggle}
                style={{
                  padding: "10px 24px",
                  borderRadius: "25px",
                  border: isJoined ? "2px solid #1db954" : "none",
                  background: isJoined ? "transparent" : "#1db954",
                  color: isJoined ? "#1db954" : "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                {isJoined ? "✓ Joined" : "+ Join Scene"}
              </button>

              {scene.isOfficial && scene.albumId && (
                <button
                  onClick={handleGoToAlbum}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "25px",
                    border: "1px solid #444",
                    background: "transparent",
                    color: "#ccc",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  🎵 View Album
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Threads Section */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Threads</h2>
        <button
          onClick={handleCreateThread}
          style={{
            padding: "10px 20px",
            borderRadius: "25px",
            background: "#1db954",
            color: "black",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          + New Thread
        </button>
      </div>

      {/* Sort Options */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {["recent", "popular", "oldest"].map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border:
                sortBy === option ? "2px solid #1db954" : "1px solid #444",
              background: sortBy === option ? "#1db95420" : "transparent",
              color: sortBy === option ? "#1db954" : "#ccc",
              cursor: "pointer",
              fontWeight: sortBy === option ? "bold" : "normal",
              textTransform: "capitalize",
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Threads List */}
      {sortedThreads.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #333",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>💬</div>
          <h3>No threads yet</h3>
          <p style={{ color: "#888", marginTop: "10px", marginBottom: "20px" }}>
            Be the first to start a conversation in this scene!
          </p>
          <button
            onClick={handleCreateThread}
            style={{
              padding: "10px 20px",
              borderRadius: "25px",
              background: "#1db954",
              color: "black",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Start Thread
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {sortedThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleThreadClick(thread.id)}
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1db954";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  gap: "12px",
                }}
              >
                <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
                  {thread.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    fontSize: "0.9rem",
                    color: "#888",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>⬆ {thread.upvotes || 0}</span>
                  <span>💬 {thread.commentCount || 0}</span>
                </div>
              </div>

              <p
                style={{
                  color: "#aaa",
                  fontSize: "0.95rem",
                  marginBottom: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                {thread.content}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  {thread.author?.charAt(0) || "U"}
                </span>
                <span>{thread.author || "Unknown"}</span>
                <span>•</span>
                <span>{formatTimeAgo(thread.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SceneDetail;
