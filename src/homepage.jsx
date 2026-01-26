// Homepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'; 

function Homepage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Guest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    // Simulate fetching user profile from local storage instead of Supabase
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) {
        setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    // specific logic to clear local auth if needed
    navigate('/login');
  };

  const navItems = ["Home", "Search/Explore", "Communities", "Activity", "Profile"];

  return (
    <div>
      {/* --- TOP HEADER --- */}
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
          <div 
            className="user-trigger" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="username-text">{username}</span>
            <span className="caret">▼</span>
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => setActiveTab('Profile')}>
                My Profile
              </div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="main-content">
        <h1>{activeTab}</h1>
        
        {activeTab === 'Home' && (
            <div style={{marginTop: '20px'}}>
                <h3>Welcome back, {username}!</h3>
                <p>Here are your top recommendations for today:</p>
                
                {/* --- CONNECTION TO ALBUM PAGE --- */}
                <div 
                    onClick={() => navigate('/album')}
                    style={{
                        marginTop: '20px', 
                        padding: '20px', 
                        background: '#333', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        border: '1px solid #555'
                    }}
                >
                    <div style={{width: '80px', height: '80px', background: '#000', borderRadius: '5px'}}></div>
                    <div>
                        <h2 style={{margin: 0}}>New Release: Drake</h2>
                        <p style={{margin: '5px 0', color: '#ccc'}}>Click here to listen and review.</p>
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