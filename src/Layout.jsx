// src/Layout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function Layout({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname; 

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Search/Explore", path: "/search" },
    { name: "Communities", path: "/communities" },
    { name: "Activity", path: "/activity" },
    { name: "Profile", path: "/profile" }
  ];

  const handleAuthAction = () => {
    if (isAuthenticated) {
      onLogout();
      navigate('/'); // Navigate to homepage after logout
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#121212', color: 'white', overflow: 'hidden' }}>
      
      {/* --- MASTER SIDEBAR --- */}
      <nav style={{ 
          width: '240px', 
          minWidth: '240px',
          backgroundColor: 'black', 
          borderRight: '1px solid #333', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '40px', color: 'white', paddingLeft: '10px' }}>
          SongApp
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map((item) => (
            <li 
              key={item.name} 
              onClick={() => navigate(item.path)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: activeTab === item.path ? '#282828' : 'transparent',
                color: activeTab === item.path ? '#fff' : '#b3b3b3',
                fontWeight: activeTab === item.path ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleAuthAction} 
            style={{ 
              background: 'transparent', 
              border: '1px solid #555', 
              color: '#aaa', 
              padding: '10px 20px', 
              borderRadius: '20px', 
              cursor: 'pointer',
              width: '100%'
            }}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>

      {/* --- CONTENT AREA (Changes based on URL) --- */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;