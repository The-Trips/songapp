// src/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function Layout({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname; 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Search/Explore", path: "/search" },
    { name: "Communities", path: "/communities" }, // <--- Added Community Tab
    { name: "Activity", path: "/activity" },
    { name: "Profile", path: "/profile" }
  ];

  const handleNavClick = (path) => {
    if (path === '/profile' && !isAuthenticated) {
        if(window.confirm("You need to create an account to view your profile. Sign up now?")) {
            navigate('/register');
        }
        return; 
    }
    navigate(path);
    setIsMenuOpen(false); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#121212', color: 'white', overflow: 'hidden' }}>
      
      {/* TOP BAR */}
      <div style={{ 
          height: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 20px', 
          borderBottom: '1px solid #333',
          backgroundColor: '#000',
          zIndex: 200
      }}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                marginRight: '20px'
            }}
          >
            ☰
          </button>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>SongApp</div>
      </div>

      {/* SIDEBAR DRAWER */}
      <div style={{ 
          position: 'fixed',
          top: '60px',
          left: 0,
          bottom: 0,
          width: '250px',
          backgroundColor: '#000',
          borderRight: '1px solid #333',
          padding: '20px',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column'
      }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map((item) => (
            <li 
              key={item.name} 
              onClick={() => handleNavClick(item.path)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: activeTab === item.path ? '#282828' : 'transparent',
                color: activeTab === item.path ? '#fff' : '#b3b3b3',
                fontWeight: activeTab === item.path ? 'bold' : 'normal',
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto' }}>
          {isAuthenticated ? (
            <button 
                onClick={onLogout} 
                style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', width: '100%' }}>
                Logout
            </button>
          ) : (
            <button 
                onClick={() => navigate('/login')} 
                style={{ background: '#065fd4', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                Log In
            </button>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {isMenuOpen && (
        <div 
            onClick={() => setIsMenuOpen(false)}
            style={{
                position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100
            }}
        />
      )}

      {/* CONTENT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;