import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function Navbar({ onLogout, activeTab = 'Home' }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const navItems = ["Home", "Search/Explore", "Communities", "Activity", "Profile"];

  const handleNavClick = (item) => {
    setCurrentTab(item);
    if (item === 'Home') {
      navigate('/');
    }
    // Add other navigation logic as needed
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">Song App</div>
      <div className="nav-links">
        {navItems.map((item) => (
          <div 
            key={item} 
            className={`nav-item ${currentTab === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
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
            <div className="dropdown-item" onClick={() => handleNavClick('Profile')}>My Profile</div>
            <div className="dropdown-item logout" onClick={onLogout}>Logout</div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;