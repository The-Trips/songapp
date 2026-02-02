import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [albumData, setAlbumData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); 

  // UI State
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewInput, setReviewInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    // Get Username from LocalStorage (set by Login.jsx)
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setCurrentUser(storedUser);

    // Fetch Album Details
    fetch(`http://localhost:8000/api/albums/${id}`)
      .then(res => res.json())
      .then(data => setAlbumData(data))
      .catch(err => console.error("Error fetching album:", err));

    // Fetch Reviews
    fetch(`http://localhost:8000/api/albums/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Error fetching reviews:", err));
  }, [id]);

  // 2. Handle Submit (Connected to Backend)
  const handlePostReview = async () => {
    // SECURITY CHECK: If no user is logged in, redirect to login
    if (!currentUser) {
        alert("You must be logged in to post a review.");
        navigate('/login');
        return;
    }

    if (!reviewInput.trim()) return;
    setIsSubmitting(true);

    const payload = {
      album_id: id,
      rating: rating,
      text: reviewInput,
      username: currentUser // Send the REAL username
    };

    try {
      const res = await fetch('http://localhost:8000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Optimistically update UI
        const newReview = { 
            id: Date.now(),
            user: currentUser, 
            text: reviewInput, 
            rating: rating, 
            date: "Just now"
        };
        setReviews([newReview, ...reviews]);
        setReviewInput('');
        setRating(0);
      } else {
        alert("Failed to save review");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!albumData) return <div style={{padding: '50px', color: 'white'}}>Loading...</div>;

  return (
    <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
      >
        ← Back
      </button>

      {/* Album Header */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end', marginBottom: '30px' }}>
         <div style={{ 
            width: '200px', height: '200px', 
            backgroundColor: '#333',
            backgroundImage: `url(${albumData.coverUrl})`,
            backgroundSize: 'cover',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
        }}></div>
        <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{albumData.title}</h1>
            <h3 style={{ margin: 0, color: '#ccc', fontWeight: 'normal' }}>{albumData.artist}</h3>
            <p style={{ color: '#888', marginTop: '5px' }}>{albumData.releaseDate}</p>
        </div>
      </div>

      {/* Rating UI */}
      <div className="rating-area" style={{ textAlign: 'center', padding: '20px', background: '#770505ff', borderRadius: '12px', border: '1px solid #9b3131ff' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Rate this Album</h3>
        <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
          {[...Array(5)].map((_, index) => {
            const val = index + 1;
            return (
              <span key={index} 
                style={{ color: val <= (hover || rating) ? "#ffc107" : "#e4e5e9", transition: "color 200ms", marginRight: '5px' }}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHover(val)}
                onMouseLeave={() => setHover(0)}
              >★</span>
            );
          })}
        </div>
      </div>

      {/* Reviews UI */}
      <div className="reviews-section" style={{ marginTop: '30px' }}>
        <h3>{reviews.length} Reviews</h3>
        
        {/* Input */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', marginTop: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {currentUser ? currentUser.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1 }}>
                <textarea 
                    value={reviewInput} 
                    onChange={(e) => setReviewInput(e.target.value)} 
                    placeholder={currentUser ? `Review as ${currentUser}...` : "Please login to review"} 
                    style={{ 
                        width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '10px',
                        backgroundColor: '#222', border: '1px solid #444', color: 'white', fontFamily: 'inherit' 
                    }} 
                />
                <button 
                    onClick={handlePostReview} 
                    disabled={!reviewInput.trim() || isSubmitting} 
                    style={{ 
                        padding: '8px 20px', borderRadius: '20px', 
                        background: currentUser ? '#065fd4' : '#555', 
                        color: '#fff', border: 'none', 
                        cursor: currentUser ? 'pointer' : 'not-allowed', 
                        fontWeight: 'bold' 
                    }}
                >
                    {isSubmitting ? "Posting..." : "Post"}
                </button>
            </div>
        </div>

        {/* List */}
        {reviews.map((r, index) => (
            <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ce5c5c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {r.user ? r.user.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div style={{ marginBottom: '5px' }}>
                        <strong>{r.user}</strong> 
                        <span style={{fontSize:'0.8em', color:'#888', marginLeft: '10px'}}>{r.date}</span>
                        {r.rating > 0 && (
                            <span style={{ marginLeft: '10px', color: '#ffc107' }}>
                                {"★".repeat(r.rating)}
                            </span>
                        )}
                    </div>
                    <div style={{ color: '#ddd', lineHeight: '1.4' }}>{r.text}</div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumPage;