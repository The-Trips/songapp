// src/CommunityDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./discussions.css";

const API_URL = "http://localhost:8000";

function CommunityDetail() {
  const navigate = useNavigate();
  const params = useParams();

  // supports both: { communityId } and { id }
  const communityIdRaw = params.communityId ?? params.id;
  const communityIdNum = Number(communityIdRaw);

  const [username, setUsername] = useState("User");
  const [community, setCommunity] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'popular' | 'oldest'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("app_username");
    if (storedUser) setUsername(storedUser);

    // joined check (localStorage)
    const savedJoined = localStorage.getItem(
      `joined_communities_${storedUser || "User"}`,
    );
    if (savedJoined) {
      const joinedList = JSON.parse(savedJoined);
      setIsJoined(joinedList.includes(communityIdNum));
    } else {
      setIsJoined(false);
    }

    fetchCommunityData();
  }, [communityIdRaw]);

  const normalizeCommunity = (data) => {
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
    // Handles both:
    //  - scenes threads: { id, title, author, content, upvotes, commentCount, createdAt }
    //  - communities threads: { id, title, text, author, likes, date }
    return {
      id: t.id ?? t.t_id ?? t._id,
      communityId: communityIdNum,
      title: t.title ?? "(No title)",
      author: t.author ?? t.username ?? "Unknown",
      content: t.content ?? t.text ?? "",
      upvotes: t.upvotes ?? t.likes ?? 0,
      commentCount: t.commentCount ?? t.comments ?? 0,
      createdAt: t.createdAt ?? t.date_created ?? t.date ?? null,
      isPinned: Boolean(t.isPinned ?? false),
    };
  };

  const fetchCommunityData = async () => {
    setIsLoading(true);

    try {
      // 1) Try scenes endpoints
      let communityRes = await fetch(`${API_URL}/api/scenes/${communityIdRaw}`);
      if (communityRes.ok) {
        const communityData = await communityRes.json();
        setCommunity(normalizeCommunity(communityData));

        // threads for scene
        const threadsRes = await fetch(
          `${API_URL}/api/scenes/${communityIdRaw}/threads`,
        );
        if (threadsRes.ok) {
          const threadsData = await threadsRes.json();
          const threadsArr = Array.isArray(threadsData)
            ? threadsData
            : (threadsData?.threads ?? []);
          setDiscussions(
            Array.isArray(threadsArr) ? threadsArr.map(normalizeThread) : [],
          );
        } else {
          setDiscussions([]);
        }

        setIsLoading(false);
        return;
      }

      // 2) Fallback: communities endpoint
      communityRes = await fetch(
        `${API_URL}/api/communities/${communityIdRaw}`,
      );
      if (!communityRes.ok) {
        setCommunity(null);
        setDiscussions([]);
        setIsLoading(false);
        return;
      }

      const data = await communityRes.json();
      setCommunity(normalizeCommunity(data));

      // Sometimes threads are included on the community payload
      const threadsArr = data?.threads ?? data?.discussions ?? [];
      setDiscussions(
        Array.isArray(threadsArr) ? threadsArr.map(normalizeThread) : [],
      );
    } catch (err) {
      console.error("Error fetching community data:", err);
      setCommunity(null);
      setDiscussions([]);
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
      localStorage.getItem(`joined_communities_${storedUser}`) || "[]";
    let joinedList = JSON.parse(savedJoined);

    if (isJoined) {
      joinedList = joinedList.filter((id) => id !== communityIdNum);
      setCommunity((prev) =>
        prev
          ? { ...prev, members: Math.max(0, (prev.members || 0) - 1) }
          : prev,
      );
    } else {
      joinedList = Array.from(new Set([...joinedList, communityIdNum]));
      setCommunity((prev) =>
        prev ? { ...prev, members: (prev.members || 0) + 1 } : prev,
      );
    }

    localStorage.setItem(
      `joined_communities_${storedUser}`,
      JSON.stringify(joinedList),
    );
    setIsJoined((v) => !v);

    // TODO: later persist join/leave to backend
  };

  const handleCreateDiscussion = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      alert("Please log in to create a discussion");
      navigate("/login");
      return;
    }
    navigate(`/community/${communityIdRaw}/discussion/create`);
  };

  const handleDiscussionClick = (discussionId) => {
    navigate(`/community/${communityIdRaw}/discussion/${discussionId}`);
  };

  const handleGoToAlbum = () => {
    if (community?.albumId) navigate(`/album/${community.albumId}`);
  };

  const sortedDiscussions = useMemo(() => {
    const arr = [...discussions];
    if (sortBy === "popular")
      return arr.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    if (sortBy === "oldest")
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [discussions, sortBy]);

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
        <p>Loading community...</p>
      </div>
    );
  }

  if (!community) {
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
        <h2>Community not found</h2>
        <button
          onClick={() => navigate("/communities")}
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
          Back to Communities
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
        ← Back to Communities
      </button>

      {/* Community Header */}
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
        {community.isOfficial && (
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
          {/* Community Image */}
          <div
            style={{
              width: "150px",
              height: "150px",
              minWidth: "150px",
              background: community.imageUrl
                ? `url(${community.imageUrl}) center/cover`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />

          {/* Community Info */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              {community.name}
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
              {community.description}
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
                👥 {(community.members ?? 0).toLocaleString()} members
              </span>
              <span>{discussions.length} discussions</span>

              {/* NEW */}
              <span>Created {formatTimeAgo(community.createdAt)}</span>

              <span>Created by {community.createdBy || "Unknown"}</span>
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
                {isJoined ? "✓ Joined" : "+ Join Community"}
              </button>

              {community.isOfficial && community.albumId && (
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

      {/* Discussions Section */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Discussions</h2>
        <button
          onClick={handleCreateDiscussion}
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
          + New Discussion
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

      {/* Discussions List */}
      {sortedDiscussions.length === 0 ? (
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
          <h3>No discussions yet</h3>
          <p style={{ color: "#888", marginTop: "10px", marginBottom: "20px" }}>
            Be the first to start a conversation in this community!
          </p>
          <button
            onClick={handleCreateDiscussion}
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
            Start Discussion
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {sortedDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              onClick={() => handleDiscussionClick(discussion.id)}
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
                  {discussion.title}
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
                  <span>⬆ {discussion.upvotes || 0}</span>
                  <span>💬 {discussion.commentCount || 0}</span>
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
                {discussion.content}
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
                  {discussion.author?.charAt(0) || "U"}
                </span>
                <span>{discussion.author || "Unknown"}</span>
                <span>•</span>
                <span>{formatTimeAgo(discussion.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunityDetail;
