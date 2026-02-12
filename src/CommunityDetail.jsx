// src/CommunityDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/communities/${id}`)
      .then(res => res.json())
      .then(data => setCommunity(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!community) return <div style={{color:'white', padding:'40px'}}>Loading...</div>;

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
         <h1 style={{ margin: '0 0 10px 0' }}>{community.name}</h1>
         <p style={{ color: '#ccc' }}>{community.description}</p>
         <button 
            onClick={() => navigate(`/community/${id}/create-discussion`)}
            style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '20px', background: '#065fd4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
         >
            Start Discussion
         </button>
      </div>

      <h2>Discussions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {community.threads.map(t => (
            <div key={t.id} style={{ borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1db954' }}>{t.title}</h3>
                <p style={{ color: '#ddd', fontSize: '0.95rem' }}>{t.text}</p>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    Posted by {t.author} • {t.likes} likes • {t.date}
                </div>
            </div>
        ))}
        {community.threads.length === 0 && <p style={{color:'#666'}}>No discussions yet.</p>}
      </div>
    </div>
  );
}

export default CommunityDetail;