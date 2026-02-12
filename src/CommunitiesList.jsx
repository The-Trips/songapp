// src/CommunitiesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CommunitiesList() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/communities')
      .then(res => res.json())
      .then(data => setCommunities(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Communities</h1>
          <button 
            onClick={() => navigate('/create-community')}
            style={{ padding: '12px 24px', borderRadius: '25px', background: '#1db954', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            + Create Community
          </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {communities.map(c => (
          <div 
            key={c.id} 
            onClick={() => navigate(`/community/${c.id}`)}
            style={{ backgroundColor: '#181818', borderRadius: '10px', padding: '20px', cursor: 'pointer', border: '1px solid #333' }}
          >
             <h3 style={{ marginTop: 0 }}>{c.name}</h3>
             <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{c.description}</p>
             <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666' }}>
                {c.followers} followers • Created by {c.owner}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunitiesList;