// AlbumPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function AlbumPage() {
  const navigate = useNavigate();
  const [username] = useState('User'); 

  // Rating State
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // Review State
  const [reviewInput, setReviewInput] = useState('');
  const [reviews, setReviews] = useState([
    { id: 1, user: 'MusicLover99', text: 'This album completely changed my perspective on Drake.', date: '2 days ago' },
    { id: 2, user: 'Alex', text: 'Solid production, but the lyrics felt a bit repetitive.', date: '5 days ago' }
  ]);

  const handlePostReview = () => {
    if (!reviewInput.trim()) return;
    const newReview = { id: Date.now(), user: username, text: reviewInput, date: 'Just now' };
    setReviews([newReview, ...reviews]);
    setReviewInput('');
  };

  return (
    <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
      >
        ← Back to Home
      </button>

      <h1>Drake - New Album</h1>

      {/* Spotify Embed */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <iframe 
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/album/40GMAhriYJRO1rsY4YdrZb?utm_source=generator" 
          width="100%" height="352" frameBorder="0" allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy" title="Spotify Embed"
        ></iframe>
      </div>

      {/* Rating & Reviews */}
      <div className="rating-area" style={{ textAlign: 'center', padding: '20px', background: '#770505ff', borderRadius: '12px', border: '1px solid #9b3131ff' }}>
        <h3>Rate this Album</h3>
        <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
          {[...Array(5)].map((_, index) => {
            const val = index + 1;
            return (
              <span key={index} 
                style={{ color: val <= (hover || rating) ? "#ffc107" : "#e4e5e9", transition: "color 200ms" }}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHover(val)}
                onMouseLeave={() => setHover(0)}
              >★</span>
            );
          })}
        </div>
      </div>

      <div className="reviews-section" style={{ marginTop: '20px' }}>
        <h3>{reviews.length} Reviews</h3>
        
        {/* Input */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{username.charAt(0)}</div>
            <div style={{ flex: 1 }}>
                <textarea 
                    value={reviewInput} 
                    onChange={(e) => setReviewInput(e.target.value)} 
                    placeholder="Add a review..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px' }} 
                />
                <button onClick={handlePostReview} disabled={!reviewInput.trim()} style={{ padding: '8px 16px', borderRadius: '20px', background: '#065fd4', color: '#fff', border: 'none', cursor: 'pointer' }}>Post</button>
            </div>
        </div>

        {/* List */}
        {reviews.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ce5c5c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.user.charAt(0)}</div>
                <div>
                    <div><strong>{r.user}</strong> <span style={{fontSize:'0.8em', color:'#ccc'}}>{r.date}</span></div>
                    <div>{r.text}</div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumPage;