import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [albumData, setAlbumData] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Form State
  const [rating, setRating] = useState(5); // Default 5/10
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Album Info & Reviews on Load
  useEffect(() => {
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

  // 2. Handle Submit
  const handlePostReview = async () => {
    if (!reviewText.trim()) return;
    setIsSubmitting(true);

    const payload = {
      album_id: id,
      rating: parseInt(rating),
      text: reviewText,
      username: "TestUser" // This matches the dummy user we created
    };

    try {
      const res = await fetch('http://localhost:8000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Refresh the list immediately
        const newReview = { 
            user: "TestUser", 
            text: reviewText, 
            rating: rating, 
            date: new Date().toISOString().split('T')[0] 
        };
        setReviews([newReview, ...reviews]);
        setReviewText('');
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

  if (!albumData) return <div style={{padding: '50px', color:'white'}}>Loading...</div>;

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1rem' }}>
        ← Back
      </button>

      {/* Album Header */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div style={{ 
            width: '280px', height: '280px', 
            backgroundColor: '#333',
            backgroundImage: `url(${albumData.coverUrl})`,
            backgroundSize: 'cover',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}></div>
        
        <div>
            <h5 style={{textTransform: 'uppercase', color: '#aaa', letterSpacing: '2px'}}>Album</h5>
            <h1 style={{ fontSize: '3.5rem', margin: '10px 0', fontWeight: '800' }}>{albumData.title}</h1>
            <h3 style={{ color: '#ccc', fontWeight: 'normal' }}>{albumData.artist} • {albumData.releaseDate}</h3>
            <p style={{ maxWidth: '600px', marginTop: '20px', color: '#bbb', lineHeight: '1.6' }}>{albumData.description || "No description available."}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #333', margin: '40px 0' }}></div>

      {/* Review Section */}
      <div style={{ display: 'flex', gap: '50px' }}>
        
        {/* Left: Input Form */}
        <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '20px' }}>Rate & Review</h3>
            
            <div style={{ backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
                
                {/* 1-10 Slider */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Rating: <span style={{color: '#1db954', fontSize: '1.2rem'}}>{rating}/10</span></label>
                    <input 
                        type="range" min="1" max="10" 
                        value={rating} 
                        onChange={(e) => setRating(e.target.value)}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                {/* Text Area */}
                <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    style={{ 
                        width: '100%', height: '120px', padding: '15px', borderRadius: '8px', 
                        backgroundColor: '#2a2a2a', border: '1px solid #444', color: 'white', 
                        fontSize: '1rem', marginBottom: '15px', fontFamily: 'inherit'
                    }}
                />
                
                <button 
                    onClick={handlePostReview} 
                    disabled={isSubmitting}
                    style={{ 
                        width: '100%', padding: '12px', borderRadius: '25px', 
                        backgroundColor: '#065fd4', color: 'white', border: 'none', 
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? "Posting..." : "Post Review"}
                </button>
            </div>
        </div>

        {/* Right: Review List */}
        <div style={{ flex: 1.5 }}>
            <h3 style={{ marginBottom: '20px' }}>Community Reviews ({reviews.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.length === 0 && <p style={{color: '#666'}}>No reviews yet. Be the first!</p>}
                
                {reviews.map((r, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#888' }}></div>
                                <span style={{ fontWeight: 'bold' }}>{r.user}</span>
                            </div>
                            <span style={{ 
                                backgroundColor: r.rating >= 7 ? '#1db954' : '#b91d1d', 
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' 
                            }}>
                                {r.rating || '-'}/10
                            </span>
                        </div>
                        <p style={{ color: '#ddd', lineHeight: '1.5', margin: '10px 0' }}>{r.text}</p>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.date}</div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}

export default AlbumPage;