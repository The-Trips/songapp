// Homepage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function Homepage() {
  const navigate = useNavigate();
  const [username] = useState('User'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const handleLogout = () => {
    navigate('/login');
  };

  const navItems = ["Home", "Search/Explore", "Communities", "Activity", "Profile"];

  // --- MOCK DATA ---
  // In a real app, these would come from an API based on user analysis
  const recommendedAlbums = [
    { id: 101, title: 'Kind of Blue', artist: 'Miles Davis', genre: 'Jazz', coverColor: '#34495e' },
    { id: 102, title: 'The Low End Theory', artist: 'A Tribe Called Quest', genre: 'Chill Rap', coverColor: '#e74c3c' },
    { id: 103, title: 'Modal Soul', artist: 'Nujabes', genre: 'Chill Rap/Jazz', coverColor: '#f1c40f' },
    { id: 104, title: 'Blue Train', artist: 'John Coltrane', genre: 'Jazz', coverColor: '#2980b9' },
  ];

  const trendingAlbums = [
    { id: 201, title: 'Midnights', artist: 'Taylor Swift', coverColor: '#8e44ad' },
    { id: 202, title: 'SOS', artist: 'SZA', coverColor: '#2ecc71' },
    { id: 203, title: 'Renaissance', artist: 'Beyoncé', coverColor: '#95a5a6' },
  ];

  const friendActivity = [
    { id: 1, user: 'Sarah', action: 'listened to', target: 'Kind of Blue', time: '2 mins ago' },
    { id: 2, user: 'Mike', action: 'reviewed', target: 'To Pimp a Butterfly', time: '1 hour ago' },
    { id: 3, user: 'Jessica', action: 'added', target: 'Jazz Classics', to: 'her playlist', time: '3 hours ago' },
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">Song App</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <div 
              key={item} 
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="user-menu-container">
          <div className="user-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="username-text">{username}</span>
            <span className="caret">▼</span>
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => setActiveTab('Profile')}>My Profile</div>
              <div className="dropdown-item logout" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content">
        <h1>{activeTab}</h1>
        
        {activeTab === 'Home' && (
          <div className="home-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
            
            {/* 1. ALBUM OF THE MONTH (Existing) */}
            <section style={{ marginBottom: '40px' }}>
              <h2>Album of the Month</h2>
              <div className="album-card" style={{ 
                border: '1px solid #444', 
                borderRadius: '12px', 
                padding: '20px', 
                textAlign: 'center',
                backgroundColor: '#222',
                color: 'white',
                maxWidth: '600px',
                margin: '20px auto'
              }}>
                <div style={{ 
                  width: '200px', 
                  height: '200px', 
                  backgroundColor: '#1db954', 
                  margin: '0 auto 20px', 
                  borderRadius: '8px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000', 
                  fontWeight: 'bold',
                  overflow: 'hidden'
                }}>
                   <img src="/public/img/istockphoto-1488911915-612x612.jpg" alt="Album Art" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <h3>The Big Feature</h3>
                <p style={{ color: '#ccc', marginBottom: '20px' }}>
                  Check out the latest release and see what others are saying.
                </p>
                <button 
                  onClick={() => navigate('/album/1')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: '#1db954',
                    color: 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  View Album & Reviews
                </button>
              </div>
            </section>

            {/* 2. RECOMMENDED FOR YOU */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ textAlign: 'left', marginLeft: '10px' }}>Recommended for You</h2>
              <p style={{ textAlign: 'left', marginLeft: '10px', color: '#888', fontSize: '0.9rem' }}>Because you like Chill Rap and Jazz</p>
              
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px' }}>
                {recommendedAlbums.map((album) => (
                  <div key={album.id} style={{ minWidth: '180px', cursor: 'pointer' }} onClick={() => navigate(`/album/${album.id}`)}>
                    <div style={{ 
                      height: '180px', 
                      backgroundColor: album.coverColor, 
                      borderRadius: '8px', 
                      marginBottom: '10px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
                    }}></div>
                    <div style={{ fontWeight: 'bold' }}>{album.title}</div>
                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{album.artist}</div>
                    <div style={{ color: '#1db954', fontSize: '0.8rem', marginTop: '4px' }}>{album.genre}</div>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              
              {/* 3. TRENDING ALBUMS */}
              <div style={{ flex: 2, minWidth: '300px' }}>
                <h2 style={{ textAlign: 'left' }}>Trending Now</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                  {trendingAlbums.map((album) => (
                    <div key={album.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/album/${album.id}`)}>
                      <div style={{ 
                        height: '140px', 
                        backgroundColor: album.coverColor, 
                        borderRadius: '8px', 
                        marginBottom: '8px' 
                      }}></div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{album.title}</div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{album.artist}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FRIEND ACTIVITY */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{ textAlign: 'left' }}>Friend Activity</h2>
                <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '12px' }}>
                  {friendActivity.map((activity) => (
                    <div key={activity.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '15px', 
                      paddingBottom: '15px', 
                      borderBottom: '1px solid #333' 
                    }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#555', marginRight: '10px', flexShrink: 0 }}></div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong> {activity.to && activity.to}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                  <button style={{ 
                    width: '100%', 
                    padding: '8px', 
                    background: 'transparent', 
                    border: '1px solid #555', 
                    color: '#ccc', 
                    borderRadius: '20px', 
                    cursor: 'pointer' 
                  }}>
                    View All Activity
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab !== 'Home' && <p>Content for {activeTab} will go here.</p>}
      </div>
    </div>
  );
}

export default Homepage;