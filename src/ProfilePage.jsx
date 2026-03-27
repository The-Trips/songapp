// src/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './ProfilePage.css';

const formatAndValidateUrl = (url) => {
    if (!url || !url.trim()) return { isValid: true, formattedUrl: "" };

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
    }

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

    const isOwnProfile = isAuthenticated && loggedInUsername === profileUsername;

    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [editInsta, setEditInsta] = useState("");
    const [editTwitter, setEditTwitter] = useState("");
    const [editWebsite, setEditWebsite] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const [editPrivacyStatus, setEditPrivacyStatus] = useState(200); 

    const [modalData, setModalData] = useState({ isOpen: false, title: "", listId: null, type: "users", list: [] });

    const DEFAULT_AVATAR = `https://ui-avatars.com/api/?name=${profileUsername}&background=random`;

    useEffect(() => {
        fetchProfile();
    }, [profileUsername]);

    const fetchProfile = () => {
        setLoading(true);
        const fetchUrl = loggedInUsername
            ? `http://localhost:8000/api/users/${profileUsername}?current_user=${loggedInUsername}`
            : `http://localhost:8000/api/users/${profileUsername}`;

        fetch(fetchUrl)
            .then(res => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then(data => {
                setUser(data);
                setEditBio(data.bio || "");
                setEditAvatar(data.avatar || DEFAULT_AVATAR);
                setEditInsta(data.insta_url || "");
                setEditTwitter(data.twitter_url || "");
                setEditWebsite(data.website_url || "");
                setEditPrivacyStatus(data.privacy_status || 200); 

                const amIFollowing = data.followers?.some(f => f.username === loggedInUsername);
                setIsFollowing(amIFollowing);

                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
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
        } catch (err) {
            console.error(err);
        }
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
                    twitter_url: twitterCheck.formattedUrl,
                    website_url: websiteCheck.formattedUrl,
                    privacy_status: editPrivacyStatus
                })
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }

            setUser(prev => ({
                ...prev,
                bio: editBio,
                avatar: editAvatar,
                insta_url: instaCheck.formattedUrl,
                twitter_url: twitterCheck.formattedUrl,
                website_url: websiteCheck.formattedUrl
            }));

            setEditInsta(instaCheck.formattedUrl);
            setEditTwitter(twitterCheck.formattedUrl);
            setEditWebsite(websiteCheck.formattedUrl);

            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("CRITICAL: Are you absolutely sure you want to delete your entire profile? This will remove all your lists, reviews, and scene history forever.")) return;
        
        try {
            const res = await fetch(`http://localhost:8000/api/users/${loggedInUsername}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert("Account deleted. We're sorry to see you go!");
                if (onLogout) onLogout();
                navigate('/register');
            } else {
                throw new Error("Failed to delete account");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const openModal = (title, list, type = "users", listId = null) => {
        setModalData({ isOpen: true, title, listId, type, list });
    };

    const handleOpenList = async (listId, listName) => {
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}`);
            if (!res.ok) throw new Error("Failed to fetch list");
            const data = await res.json();
            openModal(listName, data.albums, "albums", listId);
        } catch (err) {
            console.error(err);
            alert("Could not load list contents.");
        }
    };

    const handleRemoveFromList = async (e, listId, albumId) => {
        e.stopPropagation(); 
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}/albums/${albumId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to remove album");

            setModalData(prev => ({ ...prev, list: prev.list.filter(a => a.id !== albumId) }));
            fetchProfile();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteList = async (listId) => {
        if (!window.confirm("Are you sure you want to delete this entire list?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/lists/${listId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete list");
            closeModal();
            fetchProfile(); 
        } catch (err) {
            console.error(err);
        }
    };
    
    const closeModal = () => {
        setModalData({ isOpen: false, title: "", listId: null, type: "users", list: [] });
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
                                <button onClick={() => handleDeleteList(modalData.listId)} style={{ background: 'rgba(230, 57, 70, 0.2)', color: '#e63946', border: '1px solid #e63946', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    Delete List
                                </button>
                            )}
                            <button onClick={closeModal} className="close-btn">✖</button>
                        </div>
                    </div>
                    <div className="modal-body">
                        {modalData.list.length === 0 ? <p className="empty-text">Nothing here yet.</p> :
                            modalData.list.map((item, i) => (
                                modalData.type === "users" ? (
                                    <div key={i} className="modal-user-row stagger-in" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => { closeModal(); navigate(`/profile/${item.username}`); }}>
                                        <img src={item.avatar} alt={item.username} />
                                        <span>{item.username}</span>
                                    </div>
                                ) : (
                                    <div key={i} className="modal-user-row stagger-in" style={{ animationDelay: `${i * 0.05}s`, justifyContent: 'space-between' }} onClick={() => { closeModal(); navigate(`/album/${item.id}`); }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img src={item.cover || 'https://placehold.co/150x150?text=No+Cover'} alt={item.title} style={{ borderRadius: '8px', width: '56px', height: '56px' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>{item.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'normal' }}>{item.artist}</span>
                                            </div>
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                onClick={(e) => handleRemoveFromList(e, modalData.listId, item.id)}
                                                style={{ background: 'transparent', color: '#aaa', border: '1px solid #555', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', height: 'fit-content', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => { e.target.style.color = 'white'; e.target.style.borderColor = '#e63946'; e.target.style.background = '#e63946'; }}
                                                onMouseLeave={(e) => { e.target.style.color = '#aaa'; e.target.style.borderColor = '#555'; e.target.style.background = 'transparent'; }}
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

    if (loading) return <div className="profile-container loading">Loading Profile...</div>;
    if (error) return <div className="profile-container error">Error: {error}</div>;
    if (!user) return null;

    const privacyStatus = user?.privacy_status || 200;
    const isMutual = user && user.is_mutual;
    const canViewContent = isOwnProfile || (isAuthenticated && (
        privacyStatus === 200 || 
        (privacyStatus === 300 && isMutual)
    ));

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
            } catch (e) { console.error(e) }
        }
    };

    return (
        <div className="profile-container animate-fade-in">
            <ReusableModal />

            <div className="profile-header-actions">
                <button onClick={() => navigate(-1)} className="btn-secondary">← Back</button>
                {isOwnProfile && (
                    <div className="action-buttons">
                        {isEditing && (
                            <button onClick={handleSaveProfile} className="btn-save">
                                Save
                            </button>
                        )}
                        <button onClick={() => {
                            if (isEditing) {
                                setIsEditing(false);
                                setEditBio(user.bio || "");
                                setEditAvatar(user.avatar || DEFAULT_AVATAR);
                                setEditInsta(user.insta_url || "");
                                setEditTwitter(user.twitter_url || "");
                                setEditWebsite(user.website_url || "");
                            } else {
                                setIsEditing(true);
                            }
                        }} className="btn-primary">
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        <button onClick={() => { if (onLogout) onLogout(); navigate('/login'); }} className="btn-danger">
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <div className="profile-card">
                <div className="avatar-wrapper">
                    <img src={isEditing ? editAvatar : user.avatar} alt="avatar" className="profile-avatar" />
                    {isEditing && (
                        <div className="avatar-edit-overlay">
                            <input
                                type="text"
                                value={editAvatar}
                                onChange={(e) => setEditAvatar(e.target.value)}
                                placeholder="Image URL..."
                                className="avatar-input"
                            />
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <div className="profile-top-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <h1>{user.username}</h1>
                        {user.privacy_status === 300 && <span title="Friends Only Profile" style={{ fontSize: '1.4rem' }}>👥</span>}
                        {user.privacy_status === 400 && <span title="Private Profile" style={{ fontSize: '1.4rem' }}>🔒</span>}
                    </div>

                    {isEditing && (
                        <div style={{ margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px' }}>
                            <label style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Visibility</label>
                            <select 
                                value={editPrivacyStatus} 
                                onChange={(e) => setEditPrivacyStatus(parseInt(e.target.value))}
                                style={{ 
                                    background: '#333', 
                                    color: 'white', 
                                    border: '1px solid #444', 
                                    padding: '8px', 
                                    borderRadius: '6px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={200}>Public (Everyone)</option>
                                <option value={300}>Friends Only (Mutual Follows)</option>
                                <option value={400}>Private (Only Me)</option>
                            </select>

                            <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
                                <p style={{ color: '#e63946', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Danger Zone</p>
                                <button 
                                    onClick={handleDeleteProfile}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'transparent',
                                        color: '#e63946',
                                        border: '1px solid #e63946',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = 'rgba(230, 57, 70, 0.1)'; }}
                                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                                >
                                    Delete My Profile Permanently
                                </button>
                            </div>
                        </div>
                    )}

                    {!isOwnProfile && (
                        <button
                            onClick={handleFollowToggle}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '999px',
                                border: isMutual ? '1px solid #ffd700' : (isFollowing ? '1px solid rgba(255,255,255,0.3)' : 'none'),
                                background: (isMutual || isFollowing) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #1db954, #14833b)',
                                color: isMutual ? '#ffd700' : '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                marginTop: '15px',
                                boxShadow: (!isMutual && !isFollowing) ? '0 4px 15px rgba(29, 185, 84, 0.3)' : 'none'
                            }}
                        >
                            {isMutual ? 'Friends ✓' : (isFollowing ? 'Following' : 'Follow')}
                        </button>
                    )}

                    <div className="insta-stats">
                        <div className={`stat-box ${(isOwnProfile && user.has_unread_followers) ? 'glow-effect' : ''}`} onClick={handleFollowersClick}>
                            <span className="stat-num">{user.followers?.length || 0}</span>
                            <span className="stat-label">followers</span>
                        </div>
                        <div className="stat-box" onClick={() => canViewContent ? openModal("Following", user.followings || []) : null}>
                            <span className="stat-num">{user.followings?.length || 0}</span>
                            <span className="stat-label">following</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-num">{user.scenes?.length || 0}</span>
                            <span className="stat-label">scenes</span>
                        </div>
                    </div>

                    <div className="social-links-container" style={{ margin: '15px 0' }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                                <input type="text" value={editInsta} onChange={(e) => setEditInsta(e.target.value)} placeholder="Instagram URL" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                                <input type="text" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="Twitter/X URL" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                                <input type="text" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="Website URL" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
                                {user.insta_url && (
                                    <a href={user.insta_url} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    </a>
                                )}
                                {user.twitter_url && (
                                    <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                                    </a>
                                )}
                                {user.website_url && (
                                    <a href={user.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#ccc' }}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bio-section">
                        {isEditing ? (
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="bio-edit-input"
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p className="bio-text">{user.bio || "No biography provided."}</p>
                        )}
                    </div>
                </div>
            </div>

            {!isAuthenticated ? (
                <div className="guest-restriction">
                    <h2>Want to see more?</h2>
                    <p>Log in to view {user.username}'s full profile, custom lists, and scenes.</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
                        <button onClick={() => navigate('/register')} className="btn-secondary">Create Account</button>
                    </div>
                </div>
            ) : (
                <div className="profile-details-grid">
                    {canViewContent ? (
                        <>
                            <div className="details-section full-width">
                                <h3>Reviews ({user.reviews?.length || 0})</h3>
                                <div className="reviews-list">
                                    {user.reviews?.length > 0 ? user.reviews.map((r, i) => (
                                        <div key={i} className="review-card micro-hover stagger-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="review-header">
                                                <strong>{r.album} <span className="artist-text">by {r.artist}</span></strong>
                                                <span className="stars">{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</span>
                                            </div>
                                            <p className="review-body">"{r.text}"</p>
                                            <div className="review-footer">{r.date}</div>
                                        </div>
                                    )) : <p className="empty-text">No reviews written yet.</p>}
                                </div>
                            </div>

                            <div className="details-section full-width">
                                <h3>Custom Lists ({user.lists?.length || 0})</h3>
                                <div className="horizontal-scroll">
                                    {user.lists?.length > 0 ? user.lists.map((l, i) => (
                                        <div
                                            key={i}
                                            className="scene-card micro-hover stagger-in"
                                            onClick={() => handleOpenList(l.id, l.name)}
                                            style={{ cursor: 'pointer', animationDelay: `${i * 0.1}s` }}
                                        >
                                            <div className="scene-img" style={{ backgroundImage: `url(${l.cover || 'https://placehold.co/150x150?text=Empty'})` }}></div>
                                            <span>{l.name}</span>
                                        </div>
                                    )) : <p className="empty-text">No custom lists created yet.</p>}
                                </div>
                            </div>

                            <div className="details-section full-width">
                                <h3>Scenes Joined ({user.scenes?.length || 0})</h3>
                                <div className="horizontal-scroll">
                                    {user.scenes?.length > 0 ? user.scenes.map((s, i) => (
                                        <Link key={i} to={`/scene/${s.id}`} className="scene-card micro-hover stagger-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="scene-img" style={{ backgroundImage: `url(${s.image || 'https://placehold.co/150'})` }}></div>
                                            <span>{s.name}</span>
                                        </Link>
                                    )) : <p className="empty-text">Not in any scenes yet.</p>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="guest-restriction full-width">
                            <h2>{privacyStatus === 400 ? "🔒 This profile is private." : "👥 This profile is for friends only."}</h2>
                            <p style={{ fontSize: '1rem', marginTop: '10px' }}>
                                {privacyStatus === 400 
                                    ? "Only the owner can view this content." 
                                    : "You must be friends (follow each other) to view custom lists, scenes, and reviews."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;