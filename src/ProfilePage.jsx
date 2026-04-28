// src/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './ProfilePage.css';

const MOODS_LIST = [
    "Happy", "Sad", "Energetic", "Chill", "Focus", "Workout",
    "Late Night", "Nostalgic", "Romantic", "Angry", "Confident",
    "Anxious", "Relaxed", "Hyped", "Melancholy", "Dreamy",
    "Upbeat", "Aggressive", "Peaceful", "Groovy", "Euphoric",
    "Mellow", "Tense", "Playful", "Gloomy", "Hopeful",
    "Rebellious", "Sensual", "Triumphant", "Zen"
];

const formatAndValidateUrl = (url) => {
    if (!url || !url.trim()) return { isValid: true, formattedUrl: "" };
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = `https://${formattedUrl}`;
    try {
        new URL(formattedUrl);
        return { isValid: true, formattedUrl };
    } catch (e) {
        return { isValid: false, formattedUrl: url };
    }
};

function ProfilePage({ isAuthenticated, onLogout }) {
    const navigate = useNavigate();
    const { username: profileUsername } = useParams();
    const loggedInUsername = localStorage.getItem('app_username');

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [editInsta, setEditInsta] = useState("");
    const [editTwitter, setEditTwitter] = useState("");
    const [editWebsite, setEditWebsite] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [editPrivacyStatus, setEditPrivacyStatus] = useState(200);

    const [isFollowing, setIsFollowing] = useState(false);
    const [showMoodSelector, setShowMoodSelector] = useState(false);
    const [modalData, setModalData] = useState({ isOpen: false, title: "", listId: null, type: "users", list: [] });

    const isOwnProfile = isAuthenticated && loggedInUsername === profileUsername;
    const DEFAULT_AVATAR = `https://ui-avatars.com/api/?name=${profileUsername}&background=random`;

    useEffect(() => { fetchProfile(); }, [profileUsername]);

    const fetchProfile = () => {
        setLoading(true);
        const fetchUrl = loggedInUsername
            ? `http://localhost:8000/api/users/${profileUsername}?current_user=${loggedInUsername}`
            : `http://localhost:8000/api/users/${profileUsername}`;

        fetch(fetchUrl)
            .then(res => { if (!res.ok) throw new Error("User not found"); return res.json(); })
            .then(data => {
                setUser(data);
                setEditBio(data.bio || "");
                setEditAvatar(data.avatar || DEFAULT_AVATAR);
                setEditInsta(data.insta_url || "");
                setEditTwitter(data.twitter_url || "");
                setEditWebsite(data.website_url || "");
                setEditPrivacyStatus(data.privacy_status || 200);
                setIsFollowing(data.followers?.some(f => f.username === loggedInUsername));
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    const updateMood = async (selectedMood) => {
        if (!loggedInUsername) return;
        try {
            const response = await fetch(`http://localhost:8000/api/users/${loggedInUsername}/current-mood`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood: selectedMood })
            });
            if (response.ok) {
                setUser(prev => ({ ...prev, currentMood: selectedMood }));
                setTimeout(() => setShowMoodSelector(false), 250);
            }
        } catch (err) { console.error("Failed to update mood:", err); }
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        try {
            const res = await fetch(`http://localhost:8000/api/users/${profileUsername}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_username: loggedInUsername })
            });
            if (!res.ok) throw new Error("Failed to follow/unfollow");
            const data = await res.json();
            setIsFollowing(data.isFollowing);
            fetchProfile();
        } catch (err) { console.error(err); }
    };

    const handleSaveProfile = async () => {
        const instaCheck = formatAndValidateUrl(editInsta);
        const twitterCheck = formatAndValidateUrl(editTwitter);
        const websiteCheck = formatAndValidateUrl(editWebsite);

        if (!instaCheck.isValid) return alert("Please enter a valid Instagram URL.");
        if (!twitterCheck.isValid) return alert("Please enter a valid Twitter/X URL.");
        if (!websiteCheck.isValid) return alert("Please enter a valid Website URL.");

        try {
            const res = await fetch(`http://localhost:8000/api/users/${profileUsername}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio: editBio,
                    prof_pic_url: editAvatar,
                    insta_url: instaCheck.formattedUrl,
                    twitter_url: twitterCheck.formattedUrl,
                    website_url: websiteCheck.formattedUrl,
                    privacy_status: editPrivacyStatus
                })
            });
            if (!res.ok) throw new Error("Failed to update profile");

            setUser(prev => ({
                ...prev,
                bio: editBio,
                avatar: editAvatar,
                insta_url: instaCheck.formattedUrl,
                twitter_url: twitterCheck.formattedUrl,
                website_url: websiteCheck.formattedUrl,
                privacy_status: editPrivacyStatus
            }));
            setEditInsta(instaCheck.formattedUrl);
            setEditTwitter(twitterCheck.formattedUrl);
            setEditWebsite(websiteCheck.formattedUrl);
            setIsEditing(false);
        } catch (err) { alert(err.message); }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditBio(user?.bio || "");
        setEditAvatar(user?.avatar || DEFAULT_AVATAR);
        setEditInsta(user?.insta_url || "");
        setEditTwitter(user?.twitter_url || "");
        setEditWebsite(user?.website_url || "");
        setEditPrivacyStatus(user?.privacy_status || 200);
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("CRITICAL: Are you absolutely sure you want to delete your entire profile? This will remove all your lists, reviews, and scene history forever.")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/users/${loggedInUsername}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Account deleted. We're sorry to see you go!");
                if (onLogout) onLogout();
                navigate('/register');
            } else throw new Error("Failed to delete account");
        } catch (err) { alert(err.message); }
    };

    const openModal = (title, list, type = "users", listId = null) => {
        setModalData({ isOpen: true, title, listId, type, list });
    };

    const closeModal = () => {
        setModalData({ isOpen: false, title: "", listId: null, type: "users", list: [] });
    };

    const handleOpenList = async (listId, listName) => {
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}`);
            if (!res.ok) throw new Error("Failed to fetch list");
            const data = await res.json();
            openModal(listName, data.albums, "albums", listId);
        } catch (err) { console.error(err); alert("Could not load list contents."); }
    };

    const handleRemoveFromList = async (e, listId, albumId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}/albums/${albumId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to remove album");
            setModalData(prev => ({ ...prev, list: prev.list.filter(a => a.id !== albumId) }));
            fetchProfile();
        } catch (err) { console.error(err); }
    };

    const handleDeleteList = async (listId) => {
        if (!window.confirm("Are you sure you want to delete this entire list?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete list");
            closeModal();
            fetchProfile();
        } catch (err) { console.error(err); }
    };

    const handleFollowersClick = async () => {
        if (!canViewContent) return;
        openModal("Followers", user.followers || []);
        if (isOwnProfile && user.has_unread_followers) {
            try {
                await fetch(`http://localhost:8000/api/users/${profileUsername}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ has_unread_followers: false })
                });
                setUser(prev => ({ ...prev, has_unread_followers: false }));
            } catch (e) { console.error(e); }
        }
    };

    const ReusableModal = () => {
        if (!modalData.isOpen) return null;
        return (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{modalData.title}</h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {modalData.type === 'albums' && isOwnProfile && (
                                <button
                                    onClick={() => handleDeleteList(modalData.listId)}
                                    style={{ background: 'rgba(230,57,70,0.15)', color: '#e63946', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s' }}
                                >
                                    Delete List
                                </button>
                            )}
                            <button onClick={closeModal} className="close-btn">✕</button>
                        </div>
                    </div>
                    <div className="modal-body">
                        {modalData.list.length === 0
                            ? <p className="empty-text">Nothing here yet.</p>
                            : modalData.list.map((item, i) => (
                                modalData.type === "users" ? (
                                    <div key={i} className="modal-user-row stagger-in" style={{ animationDelay: `${i * 0.05}s` }}
                                        onClick={() => { closeModal(); navigate(`/profile/${item.username}`); }}>
                                        <img src={item.avatar} alt={item.username} />
                                        <span>{item.username}</span>
                                    </div>
                                ) : (
                                    <div key={i} className="modal-user-row stagger-in"
                                        style={{ animationDelay: `${i * 0.05}s`, justifyContent: 'space-between' }}
                                        onClick={() => { closeModal(); navigate(`/album/${item.id}`); }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <img src={item.cover || 'https://placehold.co/150x150?text=No+Cover'} alt={item.title}
                                                style={{ borderRadius: '8px', width: '52px', height: '52px', objectFit: 'cover' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>{item.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{item.artist}</span>
                                            </div>
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                onClick={(e) => handleRemoveFromList(e, modalData.listId, item.id)}
                                                className="remove-btn"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="profile-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <span style={{ color: '#666', marginTop: '16px', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading</span>
            </div>
        </div>
    );
    if (error) return <div className="profile-container error-state"><span>⚠</span> {error}</div>;
    if (!user) return null;

    const privacyStatus = user?.privacy_status || 200;
    const isMutual = user?.is_mutual;
    const canViewContent = isOwnProfile || (isAuthenticated && (
        privacyStatus === 200 ||
        (privacyStatus === 300 && isMutual)
    ));

    return (
        <div className="profile-container animate-fade-in">
            <style>{`
                /* Mood pill micro-interactions */
                .mood-pill {
                    padding: 7px 16px;
                    border-radius: 24px;
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                    user-select: none;
                    letter-spacing: 0.2px;
                }
                .mood-pill:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(0,0,0,0.35);
                }
                .mood-pill:active { transform: scale(0.93); }

                .mood-panel-enter {
                    animation: moodPanelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes moodPanelIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Edit form inputs */
                .edit-input {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.3);
                    color: #fff;
                    font-size: 0.9rem;
                    font-family: inherit;
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                    outline: none;
                }
                .edit-input:focus {
                    border-color: rgba(29,185,84,0.5);
                    box-shadow: 0 0 0 3px rgba(29,185,84,0.08);
                }
                .edit-input::placeholder { color: #555; }

                .edit-label {
                    font-size: 0.75rem;
                    color: #666;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    margin-bottom: 5px;
                    display: block;
                }

                /* Remove button in modal */
                .remove-btn {
                    background: transparent;
                    color: #777;
                    border: 1px solid #444;
                    border-radius: 7px;
                    padding: 5px 11px;
                    cursor: pointer;
                    font-size: 0.78rem;
                    height: fit-content;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                .remove-btn:hover {
                    color: white;
                    border-color: #e63946;
                    background: #e63946;
                }

                /* Loading spinner */
                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .spinner-ring {
                    width: 36px; height: 36px;
                    border: 2px solid rgba(255,255,255,0.06);
                    border-top-color: #1db954;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .error-state {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #e63946;
                    font-size: 1.1rem;
                    padding: 60px 40px;
                }

                /* Follow button hover */
                .follow-btn {
                    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                }
                .follow-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .follow-btn:active { transform: scale(0.97); }

                /* Danger zone */
                .danger-zone-btn {
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #e63946;
                    border: 1px solid rgba(230,57,70,0.3);
                    border-radius: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    letter-spacing: 0.5px;
                }
                .danger-zone-btn:hover {
                    background: rgba(230,57,70,0.1);
                    border-color: #e63946;
                }

                /* Edit privacy select */
                .privacy-select {
                    background: #222;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px 14px;
                    border-radius: 10px;
                    outline: none;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.9rem;
                    width: 100%;
                    transition: border-color 0.25s ease;
                }
                .privacy-select:focus {
                    border-color: rgba(29,185,84,0.5);
                }

                /* Section header */
                .section-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #555;
                }
            `}</style>

            <ReusableModal />

            {/* ── Top action bar ── */}
            <div className="profile-header-actions">
                <button onClick={() => navigate(-1)} className="btn-secondary">← Back</button>
                {isOwnProfile && (
                    <div className="action-buttons">
                        {isEditing && (
                            <button onClick={handleSaveProfile} className="btn-save">Save Changes</button>
                        )}
                        <button
                            onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                            className="btn-primary"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        <button onClick={() => { if (onLogout) onLogout(); navigate('/login'); }} className="btn-danger">
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* ── Profile card ── */}
            <div className="profile-card">
                {/* Avatar */}
                <div className="avatar-wrapper">
                    <img src={isEditing ? editAvatar : (user.avatar || DEFAULT_AVATAR)} alt="avatar" className="profile-avatar" />
                    {isEditing && (
                        <div className="avatar-edit-overlay">
                            <input
                                type="text"
                                value={editAvatar}
                                onChange={(e) => setEditAvatar(e.target.value)}
                                placeholder="Image URL…"
                                className="avatar-input"
                            />
                        </div>
                    )}
                </div>

                {/* Profile info */}
                <div className="profile-info">
                    {/* Username row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1>{user.username}</h1>
                        {user.privacy_status === 300 && <span title="Friends Only Profile" style={{ fontSize: '1.3rem' }}>👥</span>}
                        {user.privacy_status === 400 && <span title="Private Profile" style={{ fontSize: '1.3rem' }}>🔒</span>}
                    </div>

                    {/* ── EDIT MODE ── */}
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px', width: '100%', maxWidth: '520px' }}>

                            {/* Bio */}
                            <div>
                                <label className="edit-label">Biography</label>
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    placeholder="Write something about yourself…"
                                    className="edit-input"
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Social links */}
                            <div>
                                <label className="edit-label">Instagram URL</label>
                                <input type="text" value={editInsta} onChange={(e) => setEditInsta(e.target.value)} placeholder="instagram.com/you" className="edit-input" />
                            </div>
                            <div>
                                <label className="edit-label">Twitter / X URL</label>
                                <input type="text" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="twitter.com/you" className="edit-input" />
                            </div>
                            <div>
                                <label className="edit-label">Website URL</label>
                                <input type="text" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="yoursite.com" className="edit-input" />
                            </div>

                            {/* Privacy */}
                            <div>
                                <label className="edit-label">Profile Visibility</label>
                                <select value={editPrivacyStatus} onChange={(e) => setEditPrivacyStatus(parseInt(e.target.value))} className="privacy-select">
                                    <option value={200}>Public — Everyone can see</option>
                                    <option value={300}>Friends Only — Mutual follows</option>
                                    <option value={400}>Private — Only me</option>
                                </select>
                            </div>

                            {/* Danger zone */}
                            <div style={{ borderTop: '1px solid rgba(230,57,70,0.15)', paddingTop: '16px', marginTop: '4px' }}>
                                <p style={{ color: '#e63946', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Danger Zone</p>
                                <button onClick={handleDeleteProfile} className="danger-zone-btn">
                                    Delete My Profile Permanently
                                </button>
                            </div>
                        </div>

                    ) : (
                        /* ── VIEW MODE ── */
                        <>
                            {/* Bio */}
                            <p className="bio-text">
                                {user.bio || <span style={{ color: '#444', fontStyle: 'italic' }}>No bio yet.</span>}
                            </p>

                            {/* Currently Feeling badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '7px 18px 7px 10px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.07)', marginTop: '16px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    backgroundColor: user?.currentMood ? '#1db954' : '#333',
                                    boxShadow: user?.currentMood ? '0 0 8px rgba(29,185,84,0.7)' : 'none',
                                    transition: 'all 0.4s ease'
                                }} />
                                <span style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>Currently feeling</span>
                                <span style={{ color: user?.currentMood ? '#e8e8e8' : '#444', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {user?.currentMood || 'Neutral'}
                                </span>
                            </div>

                            {/* Follow button */}
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollowToggle}
                                    className="follow-btn"
                                    style={{
                                        marginTop: '20px',
                                        padding: '10px 26px',
                                        borderRadius: '999px',
                                        border: isMutual ? '1px solid rgba(255,215,0,0.4)' : (isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none'),
                                        background: (isMutual || isFollowing) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #1db954, #14833b)',
                                        color: isMutual ? '#ffd700' : '#fff',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.92rem',
                                        boxShadow: (!isMutual && !isFollowing) ? '0 4px 16px rgba(29,185,84,0.25)' : 'none'
                                    }}
                                >
                                    {isMutual ? '⭐ Friends' : (isFollowing ? 'Following' : 'Follow')}
                                </button>
                            )}
                        </>
                    )}

                    {/* ── Stats row ── */}
                    <div className="insta-stats" style={{ marginTop: isEditing ? '0' : '24px' }}>
                        <div className={`stat-box ${(isOwnProfile && user.has_unread_followers) ? 'glow-effect' : ''}`} onClick={handleFollowersClick}>
                            <span className="stat-num">{user.followers?.length || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat-box" onClick={() => canViewContent ? openModal("Following", user.followings || []) : null}>
                            <span className="stat-num">{user.followings?.length || 0}</span>
                            <span className="stat-label">Following</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-num">{user.scenes?.length || 0}</span>
                            <span className="stat-label">Scenes</span>
                        </div>
                    </div>

                    {/* ── Social links (view mode only) ── */}
                    {!isEditing && (
                        <div className="social-links-container" style={{ marginTop: '16px', display: 'flex', gap: '22px' }}>
                            {user.insta_url && (
                                <a href={user.insta_url} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                </a>
                            )}
                            {user.twitter_url && (
                                <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                                </a>
                            )}
                            {user.website_url && (
                                <a href={user.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#bbb' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* ── Mood Board section ── */}
                    <div style={{ marginTop: '28px', padding: '18px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', maxWidth: '680px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1rem', color: '#ccc', fontWeight: '600', letterSpacing: '0.2px' }}>Mood Board</span>
                                {user?.currentMood && (
                                    <span style={{ fontSize: '0.75rem', color: '#1db954', background: 'rgba(29,185,84,0.1)', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', border: '1px solid rgba(29,185,84,0.2)' }}>
                                        {user.currentMood}
                                    </span>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowMoodSelector(!showMoodSelector)}
                                    style={{
                                        background: showMoodSelector ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: showMoodSelector ? '#fff' : '#888',
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '0.3px'
                                    }}
                                >
                                    {showMoodSelector ? 'Close' : 'Change Mood'}
                                </button>
                            )}
                        </div>

                        {/* ── Single mood selector panel ── */}
                        {showMoodSelector && isOwnProfile && (
                            <div className="mood-panel-enter" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {MOODS_LIST.map(mood => {
                                    const isSelected = user?.currentMood === mood;
                                    return (
                                        <div
                                            key={mood}
                                            className="mood-pill"
                                            onClick={() => updateMood(mood)}
                                            style={{
                                                backgroundColor: isSelected ? '#1db954' : 'rgba(255,255,255,0.04)',
                                                color: isSelected ? '#000' : '#bbb',
                                                border: isSelected ? '1px solid #1db954' : '1px solid rgba(255,255,255,0.08)',
                                                fontWeight: isSelected ? '700' : '500',
                                                boxShadow: isSelected ? '0 4px 14px rgba(29,185,84,0.3)' : 'none',
                                                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        >
                                            {mood}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Lower content ── */}
            {!isAuthenticated ? (
                <div className="guest-restriction">
                    <h2>Want to see more?</h2>
                    <p>Log in to view {user.username}'s full profile, custom lists, and scenes.</p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
                        <button onClick={() => navigate('/register')} className="btn-secondary">Create Account</button>
                    </div>
                </div>
            ) : (
                <div className="profile-details-grid">
                    {canViewContent ? (
                        <>
                            {/* Reviews */}
                            <div className="details-section full-width">
                                <h3>Reviews <span style={{ color: '#444', fontWeight: '400', fontSize: '1rem' }}>({user.reviews?.length || 0})</span></h3>
                                <div className="reviews-list">
                                    {user.reviews?.length > 0 ? user.reviews.map((r, i) => (
                                        <div key={i} className="review-card micro-hover stagger-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                            <div className="review-header">
                                                <strong>{r.album} <span className="artist-text">by {r.artist}</span></strong>
                                                <span className="stars">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                                            </div>
                                            <p className="review-body">"{r.text}"</p>
                                            <div className="review-footer">{r.date}</div>
                                        </div>
                                    )) : <p className="empty-text">No reviews written yet.</p>}
                                </div>
                            </div>

                            {/* Custom Lists */}
                            <div className="details-section full-width">
                                <h3>Custom Lists <span style={{ color: '#444', fontWeight: '400', fontSize: '1rem' }}>({user.lists?.length || 0})</span></h3>
                                <div className="horizontal-scroll">
                                    {user.lists?.length > 0 ? user.lists.map((l, i) => (
                                        <div key={i} className="scene-card micro-hover stagger-in"
                                            onClick={() => handleOpenList(l.id, l.name)}
                                            style={{ cursor: 'pointer', animationDelay: `${i * 0.08}s` }}>
                                            <div className="scene-img" style={{ backgroundImage: `url(${l.cover || 'https://placehold.co/150x150?text=Empty'})` }} />
                                            <span>{l.name}</span>
                                        </div>
                                    )) : <p className="empty-text">No custom lists created yet.</p>}
                                </div>
                            </div>

                            {/* Scenes */}
                            <div className="details-section full-width">
                                <h3>Scenes Joined <span style={{ color: '#444', fontWeight: '400', fontSize: '1rem' }}>({user.scenes?.length || 0})</span></h3>
                                <div className="horizontal-scroll">
                                    {user.scenes?.length > 0 ? user.scenes.map((s, i) => (
                                        <Link key={i} to={`/scene/${s.id}`} className="scene-card micro-hover stagger-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                            <div className="scene-img" style={{ backgroundImage: `url(${s.image || 'https://placehold.co/150'})` }} />
                                            <span>{s.name}</span>
                                        </Link>
                                    )) : <p className="empty-text">Not in any scenes yet.</p>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="guest-restriction full-width">
                            <h2>{privacyStatus === 400 ? '🔒 This profile is private.' : '👥 Friends only profile.'}</h2>
                            <p style={{ fontSize: '1rem', marginTop: '10px' }}>
                                {privacyStatus === 400
                                    ? 'Only the owner can view this content.'
                                    : 'You must be friends (follow each other) to view custom lists, scenes, and reviews.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;