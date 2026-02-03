// src/Homepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const navigate = useNavigate();
  const [recommendedAlbums, setRecommendedAlbums] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);

  // --- Hardcoded Friend Data (Placeholder for now) ---
  const friendActivity = [
    { id: 1, user: "Sarah", action: "liked", target: "Midnights", time: "2h ago" },
    { id: 2, user: "Mike", action: "is listening to", target: "Jazz Vibes", time: "4h ago" },
    { id: 3, user: "Jessica", action: "reviewed", target: "Renaissance", time: "1d ago" },
    { id: 4, user: "David", action: "added", target: "Chill Mix", time: "2d ago" },
  ];

  useEffect(() => {
    // 1. Get Current User for the Header
    const username = localStorage.getItem('app_username');
    if (username) {
        fetch(`http://localhost:8000/api/users/${username}`)
            .then(res => res.json())
            .then(data => setCurrentUser(data))
            .catch(err => console.error(err));
    }

    // 2. Fetch Recommended
    fetch('http://localhost:8000/api/albums/recommended')
      .then(res => res.ok ? res.json() : [])
      .then(data => setRecommendedAlbums(data))
      .catch(err => setRecommendedAlbums([]));

    // 3. Fetch Trending
    fetch('http://localhost:8000/api/albums/trending')
      .then(res => res.ok ? res.json() : [])
      .then(data => setTrendingAlbums(data))
      .catch(err => setTrendingAlbums([]));
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto', color: 'white' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Home</h1>
        
        {/* Clickable Profile Picture */}
        <div 
            onClick={() => navigate('/profile')}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                background: '#222',
                padding: '5px 15px 5px 5px',
                borderRadius: '30px',
                border: '1px solid #333'
            }}
        >
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#555' }}>
                {currentUser ? (
                    <img src={currentUser.avatar} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#666' }}></div>
                )}
             </div>
             <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                {currentUser ? currentUser.username : 'Guest'}
             </span>
        </div>
      </header>

      {/* SPLIT LAYOUT: Music (Left) | Friends (Right) */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* --- LEFT: MUSIC CONTENT --- */}
        <div style={{ flex: 3, minWidth: '600px' }}>
          
          {/* Recommended */}
          <section style={{ marginBottom: '40px' }}>
            <h2>Recommended for You</h2>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
              {recommendedAlbums.length > 0 ? recommendedAlbums.map((album) => (
                <div key={album.id} onClick={() => navigate(`/album/${album.id}`)} style={{ minWidth: '180px', cursor: 'pointer' }}>
                  <div style={{ 
                    height: '180px', 
                    backgroundColor: '#333', 
                    backgroundImage: `url(${album.coverUrl})`,
                    backgroundSize: 'cover',
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}></div>
                  <div style={{ fontWeight: 'bold' }}>{album.title}</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{album.artist}</div>
                </div>
              )) : <p style={{color: '#666'}}>Loading recommendations...</p>}
            </div>
          </section>

          {/* Trending */}
          <section>
            <h2>Trending Now</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
              {trendingAlbums.map((album) => (
                <div key={album.id} onClick={() => navigate(`/album/${album.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ 
                    height: '150px', 
                    backgroundColor: '#444', 
                    backgroundImage: `url(${album.coverUrl || ''})`,
                    backgroundSize: 'cover',
                    borderRadius: '8px', 
                    marginBottom: '10px' 
                  }}></div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{album.title}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{album.artist}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- RIGHT: FRIEND ACTIVITY --- */}
        <aside style={{ flex: 1, minWidth: '280px', maxWidth: '350px' }}>
          <h3 style={{ marginBottom: '20px' }}>Friend Activity</h3>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            {friendActivity.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #333' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#444' }}></div>
                 <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.user}</span> 
                    <span style={{ color: '#aaa' }}> {item.action} </span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.target}</span>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{item.time}</div>
                 </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', color: '#065fd4', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}>View all activity</div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Homepage;