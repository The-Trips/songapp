// src/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function ProfilePage({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 1. Get logged in user from storage
    const username = localStorage.getItem('app_username');
    if (!username) {
        navigate('/login');
        return;
    }

    // 2. Fetch User Data
    fetch(`http://localhost:8000/api/users/${username}`)
        .then(res => {
            if (!res.ok) {
                if (res.status === 404) throw new Error("User not found");
                throw new Error("Failed to load profile");
            }
            return res.json();
        })
        .then(data => {
            setUser(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
            setLoading(false);
            // If user not found in DB but exists in LocalStorage, force logout
            if (err.message === "User not found") {
                localStorage.removeItem('app_username');
                localStorage.removeItem('isAuthenticated');
                alert("Session expired or user not found. Please login again.");
                navigate('/login');
            }
        });
  }, [navigate]);

  if (loading) return <div style={{padding:'20px', color:'white'}}>Loading Profile...</div>;
  if (error) return <div style={{padding:'20px', color:'red'}}>Error: {error}</div>;
  if (!user) return null; // Should have redirected already

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
      <h3>My Reviews ({user.reviews ? user.reviews.length : 0})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {(!user.reviews || user.reviews.length === 0) ? 
            <p style={{color:'#666'}}>You haven't reviewed any albums yet.</p> : 
            user.reviews.map((r, i) => (
                <div key={i} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>{r.album} <span style={{fontWeight:'normal', color:'#888'}}>by {r.artist}</span></strong>
                        <span style={{ color: '#ffc107' }}>{"★".repeat(r.rating)}</span>
                    </div>
                    <p style={{ color: '#ddd', lineHeight: '1.4' }}>{r.text}</p>
                    <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '10px' }}>Posted on {r.date}</div>
                </div>
            ))
        }
      </div>

    </div>
  );
}

export default ProfilePage;