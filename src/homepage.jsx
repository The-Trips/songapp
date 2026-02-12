// src/Homepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const navigate = useNavigate();
  const [recommendedAlbums, setRecommendedAlbums] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  
  // Dropdown State
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- Hardcoded Friend Data (Placeholder) ---
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
        if(username === 'eolo') { localStorage.clear(); window.location.reload(); return; }

        fetch(`http://localhost:8000/api/users/${username}`)
            .then(res => res.json())
            .then(data => setCurrentUser(data))
            .catch(err => console.error(err));
    }

    // 2. Fetch Recommended
    fetch('http://localhost:8000/api/albums/recommended')
      .then(res => res.ok ? res.json() : [])
      .then(data => setRecommendedAlbums(data))
      .catch(err => console.error(err));

    // 3. Fetch Trending
    fetch('http://localhost:8000/api/albums/trending')
      .then(res => res.ok ? res.json() : [])
      .then(data => setTrendingAlbums(data))
      .catch(err => console.error(err));
  }, []);

  // Logout Logic
  const handleDropdownLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('app_username');
    window.location.href = '/login'; 
  };

  const toggleDropdown = () => {
      if(!currentUser) {
          navigate('/login');
      } else {
          setShowProfileMenu(!showProfileMenu);
      }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto', color: 'white' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
        <h1>Home</h1>
        
        {/* PROFILE SECTION (Top Right) */}
        <div style={{ position: 'relative' }}>
            <div 
                onClick={toggleDropdown}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                    background: '#222', padding: '5px 15px 5px 5px', borderRadius: '30px', border: '1px solid #333'
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
                    {currentUser ? currentUser.username : 'Guest (Login)'} {currentUser && '▼'}
                </span>
            </div>

            {/* DROPDOWN MENU */}
            {showProfileMenu && currentUser && (
                <div style={{
                    position: 'absolute',
                    top: '55px',
                    right: 0,
                    backgroundColor: '#222',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    width: '150px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                    zIndex: 50,
                    overflow: 'hidden'
                }}>
                    <div 
                        onClick={() => navigate('/profile')}
                        style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #333', fontSize: '0.9rem', color: 'white' }}
                        onMouseEnter={(e) => e.target.style.background = '#333'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        Profile
                    </div>
                    <div 
                        onClick={handleDropdownLogout}
                        style={{ padding: '12px 15px', cursor: 'pointer', fontSize: '0.9rem', color: '#ff5555' }}
                        onMouseEnter={(e) => e.target.style.background = '#333'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        Logout
                    </div>
                </div>
            )}
        </div>
      </header>

      {/* MAIN CONTENT SPLIT */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: ALBUMS */}
        <div style={{ flex: 3, minWidth: '300px' }}>
          
          {/* 1. RECOMMENDED SECTION (Moved Up) */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#1db954' }}>Made For You</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '20px' 
            }}>
              {recommendedAlbums.map(album => (
                <div key={album.id} onClick={() => navigate(`/album/${album.id}`)} style={{ cursor: 'pointer', backgroundColor: '#181818', padding: '15px', borderRadius: '8px', transition: 'background 0.2s' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#333', borderRadius: '6px', marginBottom: '12px', overflow:'hidden' }}>
                      <img src={album.coverUrl} alt={album.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{album.artist}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. TRENDING SECTION (Moved Down & Changed to Grid) */}
          <section>
            <h2 style={{ marginBottom: '20px' }}>Trending Now</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Changed from Flex to Grid
                gap: '20px' 
            }}>
              {trendingAlbums.map(album => (
                <div key={album.id} onClick={() => navigate(`/album/${album.id}`)} style={{ cursor: 'pointer', backgroundColor: '#181818', padding: '15px', borderRadius: '8px', transition: 'background 0.2s' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#333', borderRadius: '6px', marginBottom: '12px', overflow:'hidden' }}>
                      <img src={album.coverUrl} alt={album.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{album.artist}</div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: FRIEND ACTIVITY (Sidebar) */}
        <aside style={{ flex: 1, minWidth: '250px', maxWidth: '350px' }}>
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
            
            {/* UPDATED LINK */}
            <div 
                onClick={() => navigate('/communities')} // <--- Added onClick
                style={{ textAlign: 'center', color: '#065fd4', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}
            >
               Find Friends
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Homepage;