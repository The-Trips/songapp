// Homepage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Ensure CSS is available

function Homepage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch username from the 'profiles' table we created
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (data) setUsername(data.username);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // The 5 Tabs
  const navItems = ["Home", "Search/Explore", "Communities", "Activity", "Profile"];

  return (
    <div>
      {/* --- TOP HEADER --- */}
      <nav className="navbar">
        <div className="nav-brand">Song App</div>
        
        {/* CENTER TABS */}
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

        {/* RIGHT SIDE: USER DROPDOWN */}
        <div className="user-menu-container">
          <div 
            className="user-trigger" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="username-text">{username}</span>
            <span className="caret">▼</span>
          </div>

          {/* DROPDOWN CONTENT */}
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
        <p>Content for {activeTab} will go here.</p>
        {activeTab === 'Home' && <p>Welcome to your Social Feed & Recommendations!</p>}
      </div>
    </div>
  );
}

export default Homepage;