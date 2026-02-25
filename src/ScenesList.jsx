// src/CommunitiesList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./threads.css";

const API_URL = "http://localhost:8000";

function ScenesList() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("User");
  const [scenes, setScenes] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'official' | 'joined'
  const [joinedScenes, setJoinedScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);

    // load joined list (kept localStorage-based)
    const savedJoined = localStorage.getItem(
      `joined_scenes_${storedUser || "User"}`,
    );
    if (savedJoined) setJoinedScenes(JSON.parse(savedJoined));

    fetchScenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeScene = (item) => {
    // Supports both "scene" + old "community" payloads with different field names
    const id = item.id ?? item._id;

    return {
      id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      isOfficial: Boolean(item.isOfficial),

      // members/followers
      members:
        item.members ??
        item.memberCount ??
        item.followers ??
        item.followersCount ??
        0,

      // threads count (fallback 0)
      threads: item.numThreads,

      createdAt: item.createdAt,
      createdBy: item.owner,
    };
  };

  const fetchScenes = async () => {
    setIsLoading(true);

    try {
      // Fallback to scenes endpoint
      let res = await fetch(`${API_URL}/api/scenes`);
      if (!res.ok)
        throw new Error(`Failed to fetch scenes. Status: ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.scenes ?? []);
      setScenes(Array.isArray(list) ? list.map(normalizeScene) : []);
    } catch (err) {
      console.error("Error fetching scenes:", err);
      setScenes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScene = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated !== "true") {
      alert("Please log in to create a scene");
      navigate("/login");
      return;
    }

    navigate("/create-scene");
  };

  const handleSceneClick = (sceneId) => {
    navigate(`/scene/${sceneId}`);
  };

  const handleJoinScene = (e, sceneId) => {
    e.stopPropagation();

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to join scenes");
      navigate("/login");
      return;
    }

    const isJoined = joinedScenes.includes(sceneId);
    let updatedJoined = joinedScenes;

    if (isJoined) {
      updatedJoined = joinedScenes.filter((id) => id !== sceneId);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? { ...s, members: Math.max(0, (s.members || 0) - 1) }
            : s,
        ),
      );
    } else {
      updatedJoined = [...joinedScenes, sceneId];
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, members: (s.members || 0) + 1 } : s,
        ),
      );
    }

    setJoinedScenes(updatedJoined);
    localStorage.setItem(
      `joined_scenes_${username}`,
      JSON.stringify(updatedJoined),
    );

    // TODO later: persist join/leave to backend
  };

  const filteredScenes = useMemo(() => {
    if (filter === "official") return scenes.filter((s) => s.isOfficial);
    if (filter === "joined")
      return scenes.filter((s) => joinedScenes.includes(s.id));
    return scenes;
  }, [scenes, filter, joinedScenes]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
        <p>Loading scenes...</p>
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
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div className="scenes-header" style={{ marginBottom: "30px" }}>
        <h1>Scenes</h1>
        <p style={{ color: "#ccc", marginTop: "10px" }}>
          Join scenes to connect with fans and discuss your favorite music
        </p>
      </div>

      {/* Filter & Create Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: filter === "all" ? "2px solid #1db954" : "1px solid #444",
              background: filter === "all" ? "#1db95420" : "transparent",
              color: filter === "all" ? "#1db954" : "#ccc",
              cursor: "pointer",
              fontWeight: filter === "all" ? "bold" : "normal",
            }}
          >
            All Scenes ({scenes.length})
          </button>

          <button
            onClick={() => setFilter("official")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border:
                filter === "official" ? "2px solid #1db954" : "1px solid #444",
              background: filter === "official" ? "#1db95420" : "transparent",
              color: filter === "official" ? "#1db954" : "#ccc",
              cursor: "pointer",
              fontWeight: filter === "official" ? "bold" : "normal",
            }}
          >
            Official ({scenes.filter((s) => s.isOfficial).length})
          </button>

          <button
            onClick={() => setFilter("joined")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border:
                filter === "joined" ? "2px solid #1db954" : "1px solid #444",
              background: filter === "joined" ? "#1db95420" : "transparent",
              color: filter === "joined" ? "#1db954" : "#ccc",
              cursor: "pointer",
              fontWeight: filter === "joined" ? "bold" : "normal",
            }}
          >
            Joined ({joinedScenes.length})
          </button>
        </div>

        <button
          onClick={handleCreateScene}
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
          + Create Scene
        </button>
      </div>

      {/* Scenes Grid */}
      {filteredScenes.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🎵</div>
          <h2>No scenes found</h2>
          <p style={{ marginTop: "10px" }}>
            {filter === "joined"
              ? "You haven't joined any scenes yet. Explore and join some!"
              : "No scenes available at the moment."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          {filteredScenes.map((scene) => {
            const isJoined = joinedScenes.includes(scene.id);

            return (
              <div
                key={scene.id}
                onClick={() => handleSceneClick(scene.id)}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1db954";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Official Badge */}
                {scene.isOfficial && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#1db954",
                      color: "black",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    OFFICIAL
                  </div>
                )}

                {/* Scene Image */}
                <div
                  style={{
                    width: "100%",
                    height: "150px",
                    background: scene.imageUrl
                      ? `url(${scene.imageUrl}) center/cover`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                />

                {/* Scene Info */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {scene.name}
                </h3>

                <p
                  style={{
                    color: "#aaa",
                    fontSize: "0.9rem",
                    marginBottom: "15px",
                    height: "40px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {scene.description}
                </p>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    fontSize: "0.85rem",
                    color: "#888",
                    marginBottom: "15px",
                  }}
                >
                  <span>
                    👥 {(scene.members ?? 0).toLocaleString()} members
                  </span>
                  <span>
                    💬 {(scene.threads ?? 0).toLocaleString()}{" "}
                    threads
                  </span>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "15px",
                    borderTop: "1px solid #333",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "#666" }}>
                    Created {formatDate(scene.createdAt)}
                    {scene.createdBy ? ` by ${scene.createdBy}` : ""}
                  </span>

                  <button
                    onClick={(e) => handleJoinScene(e, scene.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border: isJoined ? "1px solid #1db954" : "1px solid #444",
                      background: isJoined ? "transparent" : "#1db954",
                      color: isJoined ? "#1db954" : "black",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                    }}
                  >
                    {isJoined ? "✓ Joined" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScenesList;
