import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function ProfilePage({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // 1. Get logged in user
    const username = localStorage.getItem('app_username');
    if (!username) {
        navigate('/login');
        return;
    }

    // 2. Fetch User Data & Reviews from DB
    fetch(`http://localhost:8000/api/users/${username}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error(err));
  }, [navigate]);

  if (!user) return <div style={{padding:'20px', color:'white'}}>Loading Profile...</div>;

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
          ← Home
        </button>
        <button onClick={() => { if(onLogout) onLogout(); navigate('/login'); }} style={{ background: '#770505', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', padding: '30px', background: '#222', borderRadius: '12px', marginBottom: '40px' }}>
         <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#555', overflow: 'hidden' }}>
            <img src={user.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
         </div>
         <div>
             <h1 style={{ margin: '0 0 10px 0' }}>{user.username}</h1>
             <p style={{ color: '#aaa', margin: 0 }}>{user.bio}</p>
         </div>
      </div>

      {/* User's Reviews */}
      <h3>My Reviews ({user.reviews.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {user.reviews.length === 0 ? <p style={{color:'#666'}}>You haven't reviewed any albums yet.</p> : user.reviews.map((r, i) => (
            <div key={i} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{r.album} <span style={{fontWeight:'normal', color:'#888'}}>by {r.artist}</span></strong>
                    <span style={{ color: '#ffc107' }}>{"★".repeat(r.rating)}</span>
                </div>
                <p style={{ color: '#ddd', lineHeight: '1.4' }}>{r.text}</p>
                <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '10px' }}>Posted on {r.date}</div>
            </div>
        ))}
      </div>

    </div>
  );
}

export default ProfilePage;