// src/AlbumPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";

function AlbumPage({ isAuthenticated }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data State
  const [albumData, setAlbumData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // User State
  const currentUsername = localStorage.getItem("app_username");

  // Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumRes = await fetch(`http://localhost:8000/api/albums/${id}`);
        const albumJson = await albumRes.json();
        setAlbumData(albumJson);

        const reviewRes = await fetch(
          `http://localhost:8000/api/albums/${id}/reviews`,
        );
        const reviewJson = await reviewRes.json();
        setReviews(reviewJson);

        fetchMoods();
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUsername]);

  const fetchMoods = async () => {
    try {
      let url = `http://localhost:8000/api/albums/${id}/moods`;
      if (currentUsername) url += `?current_user=${currentUsername}`;
      const res = await fetch(url);
      const data = await res.json();
      setMoods(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- ACTIONS ---
  const handleReviewButtonClick = () => {
    if (!currentUsername) {
      navigate("/login");
      return;
    }
    setShowReviewModal(true);
  };

  const handleCommunityClick = () => {
    // If the album is linked to a scene/community, go there. Otherwise go to list.
    if (albumData && albumData.sceneId) {
      navigate(`/community/${albumData.sceneId}`);
    } else {
      navigate("/communities");
    }
  };

  const handleMoodClick = async (moodId) => {
    if (!currentUsername) {
      if (window.confirm("Log in to vote on the album's vibe?"))
        navigate("/login");
      return;
    }
    // Optimistic Update
    setMoods((prev) =>
      prev.map((m) =>
        m.id === moodId
          ? {
              ...m,
              selected: !m.selected,
              count: m.selected ? m.count - 1 : m.count + 1,
            }
          : m,
      ),
    );

    try {
      await fetch("http://localhost:8000/api/moods/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          album_id: id,
          mood_id: moodId,
          username: currentUsername,
        }),
      });
      fetchMoods();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      alert("Please select a star rating!");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        album_id: id,
        rating: userRating,
        text: reviewText,
        username: currentUsername,
      };
      const res = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newReview = {
          user: currentUsername,
          text: reviewText,
          rating: userRating,
          date: new Date().toISOString().split("T")[0],
        };
        setReviews([newReview, ...reviews]);
        setShowReviewModal(false);
        setReviewText("");
        setUserRating(0);
      } else {
        alert("Failed to save review");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown Duration";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  if (loading || !albumData)
    return <div style={{ padding: "50px", color: "white" }}>Loading...</div>;

  return (
    <div style={styles.pageContainer}>
      {/* 1. HERO SECTION */}
      <div style={styles.heroSection}>
        <div style={styles.coverContainer}>
          <img
            src={albumData.coverUrl}
            alt={albumData.title}
            style={styles.coverImage}
          />
        </div>

        <div style={styles.infoContainer}>
          <h4 style={styles.subHeader}>ALBUM</h4>
          <h1 style={styles.title}>{albumData.title}</h1>

          <div style={styles.metaRow}>
            <span style={styles.artistName}>{albumData.artist}</span>
            <span style={styles.dot}>•</span>
            <span>
              {albumData.releaseDate
                ? albumData.releaseDate.substring(0, 4)
                : "Unknown Year"}
            </span>
            <span style={styles.dot}>•</span>
            <span>{albumData.trackCount || 0} Songs</span>
            <span style={styles.dot}>•</span>
            <span style={{ color: "#aaa" }}>
              {formatDuration(albumData.duration)}
            </span>
          </div>

          {/* GENRES DISPLAY */}
          {albumData.genres && albumData.genres.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "25px",
              }}
            >
              {albumData.genres.map((genre, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "0.8rem",
                    padding: "4px 12px",
                    borderRadius: "15px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ddd",
                    border: "1px solid #444",
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div style={styles.actionRow}>
            <button
              onClick={handleReviewButtonClick}
              style={styles.primaryButton}
            >
              {currentUsername ? "★ Rate & Review" : "Log in to Review"}
            </button>
            {/* NEW COMMUNITY BUTTON */}
            <button
              onClick={handleCommunityClick}
              style={styles.secondaryButton}
            >
              👥 Community
            </button>
          </div>
        </div>
      </div>

      {/* 2. MOODS SECTION */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Vibe Check</h3>
        <p style={{ color: "#888", marginBottom: "15px", fontSize: "0.9rem" }}>
          How does this album make you feel?
        </p>
        <div style={styles.moodGrid}>
          {moods.slice(0, 15).map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              style={{
                ...styles.moodChip,
                backgroundColor: mood.selected ? "#1db954" : "#2a2a2a",
                color: mood.selected ? "#000" : "#fff",
                borderColor: mood.selected ? "#1db954" : "#444",
              }}
            >
              {mood.name}
              <span
                style={{
                  opacity: 0.6,
                  fontSize: "0.8em",
                  marginLeft: "8px",
                  background: mood.selected
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(255,255,255,0.1)",
                  padding: "2px 6px",
                  borderRadius: "10px",
                }}
              >
                {mood.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.divider}></div>

      {/* 3. REVIEWS */}
      <div style={styles.section}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "20px",
          }}
        >
          <h3 style={styles.sectionTitle}>Community Reviews</h3>
          <span style={{ color: "#aaa" }}>
            Avg Rating: <b style={{ color: "white" }}>{averageRating}</b> / 5
          </span>
        </div>
        <div style={styles.reviewGrid}>
          {reviews.length === 0 ? (
            <p style={{ color: "#666" }}>No reviews yet.</p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={{ fontWeight: "bold", color: "#fff" }}>
                    {r.user}
                  </div>
                  <div style={{ color: "#f5c518" }}>
                    {"★".repeat(Math.round(r.rating || 0))}
                    <span style={{ color: "#444" }}>
                      {"★".repeat(5 - Math.round(r.rating || 0))}
                    </span>
                  </div>
                </div>
                <p style={styles.reviewText}>"{r.text}"</p>
                <div style={styles.reviewDate}>{r.date}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {showReviewModal && currentUsername && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
              Rate {albumData.title}
            </h2>
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: "2.5rem",
                    cursor: "pointer",
                    color:
                      (hoverRating || userRating) >= star ? "#f5c518" : "#444",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={styles.textArea}
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowReviewModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Post Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
    color: "white",
  },
  heroSection: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-end",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  coverContainer: {
    width: "260px",
    height: "260px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
  },
  coverImage: { width: "100%", height: "100%", objectFit: "cover" },
  infoContainer: { flex: 1, minWidth: "300px" },
  subHeader: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    letterSpacing: "2px",
    color: "#1db954",
    marginBottom: "10px",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "900",
    margin: "0 0 15px 0",
    lineHeight: "1.1",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#ccc",
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "15px",
  },
  artistName: { color: "white", fontWeight: "bold" },
  dot: { fontSize: "1.5rem", lineHeight: "0" },
  actionRow: { display: "flex", gap: "15px" },
  primaryButton: {
    padding: "14px 32px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: "#1db954",
    color: "black",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  secondaryButton: {
    padding: "14px 32px",
    borderRadius: "30px",
    border: "1px solid #555",
    backgroundColor: "transparent",
    color: "white",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  section: { marginBottom: "40px" },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  divider: { height: "1px", backgroundColor: "#333", margin: "40px 0" },
  moodGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },
  moodChip: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #444",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  reviewCard: {
    backgroundColor: "#181818",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #282828",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  reviewText: {
    color: "#ddd",
    lineHeight: "1.5",
    fontSize: "0.95rem",
    marginBottom: "15px",
  },
  reviewDate: { fontSize: "0.8rem", color: "#666" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#222",
    padding: "40px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    border: "1px solid #333",
  },
  starContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  textArea: {
    width: "100%",
    height: "100px",
    backgroundColor: "#333",
    border: "none",
    borderRadius: "8px",
    padding: "15px",
    color: "white",
    fontSize: "1rem",
    marginBottom: "20px",
    resize: "none",
  },
  modalActions: { display: "flex", gap: "15px", justifyContent: "flex-end" },
  cancelButton: {
    background: "transparent",
    border: "none",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "1rem",
  },
  submitButton: {
    backgroundColor: "white",
    color: "black",
    padding: "10px 25px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AlbumPage;
