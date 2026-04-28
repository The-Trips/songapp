// src/AlbumPage.jsx
// ─────────────────────────────────────────────────────────────
// Handles two album types:
//   • DB album    → id is a plain integer  → /album/42
//   • Spotify album → id is "spotify_<id>" → /album/spotify_4eLPsYPBmXABThSJ5ljJZh
//
// Both types share the same reviews / moods system via a DB record.
// For Spotify albums, the backend auto-creates a thin DB row on first
// view so ratings and reviews can be stored as normal.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";
import "./App.css";

function AlbumPage({ isAuthenticated }) {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const currentUsername = localStorage.getItem("app_username");

  // ── detect source ──────────────────────────────────────────
  const isSpotifyAlbum = id.startsWith("spotify_");
  const spotifyId      = isSpotifyAlbum ? id.replace("spotify_", "") : null;

  // ── data state ─────────────────────────────────────────────
  const [albumData,    setAlbumData]    = useState(null);
  const [reviews,      setReviews]      = useState([]);
  const [moods,        setMoods]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  // dbAlbumId is the integer PK we use for reviews/moods.
  // For DB albums it equals `id`; for Spotify albums it comes from the API.
  const [dbAlbumId,    setDbAlbumId]    = useState(null);

  // ── modal state ────────────────────────────────────────────
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating,      setUserRating]      = useState(0);
  const [hoverRating,     setHoverRating]     = useState(0);
  const [reviewText,      setReviewText]      = useState("");
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  // ── list modal state ───────────────────────────────────────
  const [showListModal, setShowListModal] = useState(false);
  const [userLists,     setUserLists]     = useState([]);
  const [newListName,   setNewListName]   = useState("");

  // ── track list toggle ──────────────────────────────────────
  const [showTracks, setShowTracks] = useState(false);

  // ═══════════════════════════════════════════════════════════
  //  FETCH
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Album metadata (DB or Spotify)
        const endpoint = isSpotifyAlbum
          ? `http://localhost:8000/api/albums/spotify/${spotifyId}`
          : `http://localhost:8000/api/albums/${id}`;

        const albumRes  = await fetch(endpoint);
        if (!albumRes.ok) throw new Error("Album not found");
        const albumJson = await albumRes.json();
        setAlbumData(albumJson);

        // Resolve the integer DB id for reviews/moods
        const resolvedDbId = albumJson.dbAlbumId ?? (isSpotifyAlbum ? null : parseInt(id));
        setDbAlbumId(resolvedDbId);

        // 2. Reviews + moods (only if we have a DB id)
        if (resolvedDbId) {
          const [reviewRes, moodRes] = await Promise.all([
            fetch(`http://localhost:8000/api/albums/${resolvedDbId}/reviews`),
            fetch(`http://localhost:8000/api/albums/${resolvedDbId}/moods${currentUsername ? `?current_user=${currentUsername}` : ""}`),
          ]);
          const reviewJson = reviewRes.ok ? await reviewRes.json() : [];
          const moodJson   = moodRes.ok  ? await moodRes.json()   : [];
          setReviews(reviewJson);
          setMoods(moodJson);

          // Pre-fill if user already left a review
          const mine = reviewJson.find((r) => r.user === currentUsername);
          if (mine) { setUserRating(mine.rating); setReviewText(mine.text); }
        }
      } catch (err) {
        console.error("Error fetching album page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const refreshMoods = async () => {
    if (!dbAlbumId) return;
    try {
      const res  = await fetch(`http://localhost:8000/api/albums/${dbAlbumId}/moods${currentUsername ? `?current_user=${currentUsername}` : ""}`);
      const data = await res.json();
      setMoods(data);
    } catch (e) { console.error(e); }
  };

  // ═══════════════════════════════════════════════════════════
  //  ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handleReviewButtonClick = () => {
    if (!currentUsername) { navigate("/login"); return; }
    if (!dbAlbumId) {
      alert("This album's data is still loading. Try again in a moment.");
      return;
    }
    const existing = reviews.find((r) => r.user === currentUsername);
    if (existing) { setUserRating(existing.rating); setReviewText(existing.text); }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) { alert("Please select a star rating!"); return; }
    if (!dbAlbumId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          album_id: dbAlbumId,
          rating:   userRating,
          text:     reviewText,
          username: currentUsername,
        }),
      });
      if (res.ok) {
        const newReview = {
          user:         currentUsername,
          text:         reviewText,
          rating:       userRating,
          date:         new Date().toISOString().split("T")[0],
          date_updated: new Date().toISOString().replace("T", " ").split(".")[0],
          created_at:   reviews.find((r) => r.user === currentUsername)?.created_at
                        || new Date().toISOString().replace("T", " ").split(".")[0],
        };
        setReviews((prev) => [newReview, ...prev.filter((r) => r.user !== currentUsername)]);
        setShowReviewModal(false);
      } else {
        alert("Failed to save review");
      }
    } catch { alert("Error connecting to server"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Remove your review for this album?")) return;
    if (!dbAlbumId) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/albums/${dbAlbumId}/reviews?username=${currentUsername}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.user !== currentUsername));
        setUserRating(0); setReviewText("");
      } else alert("Failed to delete review.");
    } catch { alert("Error connecting to server."); }
  };

  const handleMoodClick = async (moodId) => {
    if (!currentUsername) { if (window.confirm("Log in to vote on the album's vibe?")) navigate("/login"); return; }
    if (!dbAlbumId) return;
    // Optimistic update
    setMoods((prev) => prev.map((m) =>
      m.id === moodId ? { ...m, selected: !m.selected, count: m.selected ? m.count - 1 : m.count + 1 } : m
    ));
    try {
      await fetch("http://localhost:8000/api/moods/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album_id: dbAlbumId, mood_id: moodId, username: currentUsername }),
      });
      refreshMoods();
    } catch (e) { console.error(e); }
  };

  const handleSceneClick = () => {
    if (albumData?.sceneId) navigate(`/scene/${albumData.sceneId}`);
    else navigate("/scenes");
  };

  const handleOpenListModal = async () => {
    if (!currentUsername) { navigate("/login"); return; }
    try {
      const res  = await fetch(`http://localhost:8000/api/users/${currentUsername}`);
      const data = await res.json();
      setUserLists(data.lists || []);
      setShowListModal(true);
    } catch (err) { console.error("Failed to load lists", err); }
  };

  const handleAddToList = async (listId) => {
    if (!dbAlbumId) return;
    try {
      await fetch("http://localhost:8000/api/lists/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list_id: listId, album_id: dbAlbumId }),
      });
      alert("Album added to list!");
      setShowListModal(false);
    } catch (err) { console.error(err); }
  };

  const handleCreateListAndAdd = async () => {
    if (!newListName.trim()) return;
    try {
      const res  = await fetch(`http://localhost:8000/api/users/${currentUsername}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUsername, name: newListName }),
      });
      const data = await res.json();
      await handleAddToList(data.id);
      setNewListName("");
    } catch (err) { console.error(err); }
  };

  // ═══════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════
  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown Duration";
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "N/A";

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  if (loading || !albumData)
    return <div style={{ padding: "50px", color: "white" }}>Loading...</div>;

  const tracks = albumData.tracks || [];

  return (
    <div style={styles.pageContainer}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div style={styles.heroSection}>
        <div style={styles.coverContainer}>
          <img src={albumData.coverUrl} alt={albumData.title} style={styles.coverImage} />
        </div>

        <div style={styles.infoContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <h4 style={styles.subHeader}>ALBUM</h4>
            {/* Spotify badge for Spotify-sourced albums */}
            {albumData.source === "spotify" && (
              <a
                href={albumData.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "0.72rem", fontWeight: "700",
                  color: "#1db954", textDecoration: "none",
                  border: "1px solid rgba(29,185,84,0.4)",
                  padding: "3px 10px", borderRadius: "20px",
                  transition: "background 0.2s",
                }}
              >
                ▶ Open in Spotify
              </a>
            )}
          </div>

          <h1 style={styles.title}>{albumData.title}</h1>

          <div style={styles.metaRow}>
            <span style={styles.artistName}>{albumData.artist}</span>
            <span style={styles.dot}>•</span>
            <span>{albumData.releaseDate ? albumData.releaseDate.substring(0, 4) : "Unknown Year"}</span>
            <span style={styles.dot}>•</span>
            <span>{albumData.trackCount || 0} Songs</span>
            <span style={styles.dot}>•</span>
            <span style={{ color: "#aaa" }}>{formatDuration(albumData.duration)}</span>
            {albumData.label && (
              <>
                <span style={styles.dot}>•</span>
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>{albumData.label}</span>
              </>
            )}
          </div>

          {/* Genres */}
          {albumData.genres && albumData.genres.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "25px" }}>
              {albumData.genres.map((genre, idx) => (
                <span key={idx} style={{
                  fontSize: "0.8rem", padding: "4px 12px", borderRadius: "15px",
                  backgroundColor: "rgba(255,255,255,0.1)", color: "#ddd", border: "1px solid #444",
                }}>
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Popularity bar (Spotify albums only) */}
          {albumData.popularity != null && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Spotify Popularity
              </div>
              <div style={{ background: "#333", borderRadius: "4px", height: "5px", width: "200px" }}>
                <div style={{
                  background: "linear-gradient(90deg, #1db954, #1ed760)",
                  borderRadius: "4px", height: "100%",
                  width: `${albumData.popularity}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px", display: "block" }}>
                {albumData.popularity} / 100
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={styles.actionRow}>
            <button onClick={handleReviewButtonClick} style={styles.primaryButton}>
              {currentUsername ? "★ Rate & Review" : "Log in to Review"}
            </button>
            <button onClick={handleSceneClick} style={styles.secondaryButton}>👥 Scene</button>
            <button onClick={handleOpenListModal} style={styles.secondaryButton}>+ Add to List</button>
          </div>
        </div>
      </div>

      {/* ── TRACK LIST (Spotify albums) ─────────────────────────── */}
      {tracks.length > 0 && (
        <div style={{ ...styles.section, marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={styles.sectionTitle}>Tracklist</h3>
            <button
              onClick={() => setShowTracks((p) => !p)}
              style={{ background: "transparent", border: "1px solid #444", color: "#aaa", padding: "5px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "0.82rem" }}
            >
              {showTracks ? "Hide" : "Show All"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {(showTracks ? tracks : tracks.slice(0, 5)).map((track, i) => (
              <div
                key={i}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "6px",
                  backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  color: "#ddd", fontSize: "0.9rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ color: "#555", width: "20px", textAlign: "right", fontSize: "0.8rem" }}>
                    {track.number}
                  </span>
                  <span>{track.name}</span>
                </div>
                <span style={{ color: "#666", fontSize: "0.82rem" }}>{track.duration}</span>
              </div>
            ))}
            {!showTracks && tracks.length > 5 && (
              <button
                onClick={() => setShowTracks(true)}
                style={{ background: "transparent", border: "none", color: "#666", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", padding: "10px 14px" }}
              >
                + {tracks.length - 5} more tracks
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── VIBE CHECK ────────────────────────────────────────────── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Vibe Check</h3>
        <p style={{ color: "#888", marginBottom: "15px", fontSize: "0.9rem" }}>
          How does this album make you feel?
        </p>
        {dbAlbumId ? (
          <div style={styles.moodGrid}>
            {moods.slice(0, 15).map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodClick(mood.id)}
                style={{
                  ...styles.moodChip,
                  backgroundColor: mood.selected ? "#1db954" : "#2a2a2a",
                  color:           mood.selected ? "#000" : "#fff",
                  borderColor:     mood.selected ? "#1db954" : "#444",
                }}
              >
                {mood.name}
                <span style={{
                  opacity: 0.6, fontSize: "0.8em", marginLeft: "8px",
                  background: mood.selected ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)",
                  padding: "2px 6px", borderRadius: "10px",
                }}>
                  {mood.count}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: "#555", fontStyle: "italic" }}>Loading vibe data…</p>
        )}
      </div>

      <div style={styles.divider} />

      {/* ── REVIEWS ───────────────────────────────────────────────── */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
          <h3 style={styles.sectionTitle}>Scene Reviews</h3>
          <span style={{ color: "#aaa" }}>
            Avg Rating: <b style={{ color: "white" }}>{averageRating}</b> / 5
          </span>
        </div>

        {!dbAlbumId && (
          <p style={{ color: "#666", fontStyle: "italic" }}>Reviews load after the album is registered — refresh in a moment.</p>
        )}

        <div style={styles.reviewGrid}>
          {reviews.length === 0 ? (
            <p style={{ color: "#666" }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r, i) => {
              const isMine   = r.user === currentUsername;
              const isEdited = r.date_updated && r.date_updated !== r.created_at;
              return (
                <div key={i} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        onClick={() => navigate(`/profile/${r.user}`)}
                        style={{ fontWeight: "bold", color: "#fff", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {r.user}
                        {isMine && (
                          <span style={{ marginLeft: "8px", fontSize: "0.7rem", backgroundColor: "#1db954", color: "black", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ color: "#f5c518" }}>
                      {"★".repeat(Math.round(r.rating || 0))}
                      <span style={{ color: "#444" }}>{"★".repeat(5 - Math.round(r.rating || 0))}</span>
                    </div>
                  </div>
                  <p style={styles.reviewText}>"{r.text}"</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={styles.reviewDate}>
                      {r.date}
                      {isEdited && <span style={{ marginLeft: "8px", fontStyle: "italic", opacity: 0.6 }}>(edited)</span>}
                    </div>
                    {isMine && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={handleReviewButtonClick} style={styles.iconButton} title="Edit Review">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={handleDeleteReview} style={{ ...styles.iconButton, color: "#ff4444" }} title="Delete Review">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── REVIEW MODAL ──────────────────────────────────────────── */}
      {showReviewModal && currentUsername && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Rate {albumData.title}</h2>
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{ fontSize: "2.5rem", cursor: "pointer", color: (hoverRating || userRating) >= star ? "#f5c518" : "#444", transition: "color 0.2s" }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                >★</span>
              ))}
            </div>
            <textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={styles.textArea}
            />
            <div style={styles.modalActions}>
              <button onClick={() => setShowReviewModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleSubmitReview} style={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Post Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIST MODAL ────────────────────────────────────────────── */}
      {showListModal && currentUsername && (
        <div style={styles.modalOverlay} onClick={() => setShowListModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Add to List</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="New list name…"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #444", background: "#333", color: "white" }}
              />
              <button onClick={handleCreateListAndAdd} style={styles.submitButton}>Create</button>
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {userLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  style={{ padding: "12px", background: "#333", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", textAlign: "left" }}
                >
                  {list.name}
                </button>
              ))}
              {userLists.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>No lists yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = {
  pageContainer:  { padding: "40px", maxWidth: "1000px", margin: "0 auto", color: "white" },
  heroSection:    { display: "flex", gap: "40px", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap" },
  coverContainer: { width: "260px", height: "260px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", flexShrink: 0 },
  coverImage:     { width: "100%", height: "100%", objectFit: "cover" },
  infoContainer:  { flex: 1, minWidth: "300px" },
  subHeader:      { fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "2px", color: "#1db954", margin: 0 },
  title:          { fontSize: "3.5rem", fontWeight: "900", margin: "0 0 15px 0", lineHeight: "1.1" },
  metaRow:        { display: "flex", alignItems: "center", gap: "8px", color: "#ccc", fontSize: "1rem", fontWeight: "500", marginBottom: "15px", flexWrap: "wrap" },
  artistName:     { color: "white", fontWeight: "bold" },
  dot:            { fontSize: "1.5rem", lineHeight: "0" },
  actionRow:      { display: "flex", gap: "15px", flexWrap: "wrap" },
  primaryButton:  { padding: "14px 32px", borderRadius: "30px", border: "none", backgroundColor: "#1db954", color: "black", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" },
  secondaryButton:{ padding: "14px 32px", borderRadius: "30px", border: "1px solid #555", backgroundColor: "transparent", color: "white", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" },
  section:        { marginBottom: "40px" },
  sectionTitle:   { fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px" },
  divider:        { height: "1px", backgroundColor: "#333", margin: "40px 0" },
  moodGrid:       { display: "flex", flexWrap: "wrap", gap: "10px" },
  moodChip:       { padding: "8px 16px", borderRadius: "20px", border: "1px solid #444", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", transition: "all 0.2s ease", background: "transparent" },
  reviewGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  reviewCard:     { backgroundColor: "#181818", padding: "20px", borderRadius: "8px", border: "1px solid #282828", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  reviewHeader:   { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  reviewText:     { color: "#ddd", lineHeight: "1.5", fontSize: "0.95rem", marginBottom: "15px" },
  reviewDate:     { fontSize: "0.8rem", color: "#666" },
  iconButton:     { background: "transparent", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "4px", transition: "all 0.2s" },
  modalOverlay:   { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent:   { backgroundColor: "#222", padding: "40px", borderRadius: "12px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.8)", border: "1px solid #333" },
  starContainer:  { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" },
  textArea:       { width: "100%", height: "100px", backgroundColor: "#333", border: "none", borderRadius: "8px", padding: "15px", color: "white", fontSize: "1rem", marginBottom: "20px", resize: "none", boxSizing: "border-box" },
  modalActions:   { display: "flex", gap: "15px", justifyContent: "flex-end" },
  cancelButton:   { background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1rem" },
  submitButton:   { backgroundColor: "white", color: "black", padding: "10px 25px", borderRadius: "20px", border: "none", fontWeight: "bold", cursor: "pointer" },
};

export default AlbumPage;