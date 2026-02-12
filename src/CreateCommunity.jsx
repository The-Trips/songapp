// src/CreateCommunity.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateCommunity() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem('app_username');
    if (!username) { navigate('/login'); return; }

    setIsSubmitting(true);
    try {
        const res = await fetch('http://localhost:8000/api/communities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description: desc, username })
        });
        if (res.ok) {
            navigate('/communities');
        } else {
            alert('Failed to create community');
        }
    } catch(err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Create a Community</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="text" placeholder="Community Name" value={name} onChange={e=>setName(e.target.value)} style={{ padding: '15px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: 'white' }} required />
            <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} style={{ padding: '15px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: 'white', height: '100px' }} required />
            <button type="submit" disabled={isSubmitting} style={{ padding: '15px', borderRadius: '25px', background: '#1db954', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {isSubmitting ? 'Creating...' : 'Create Community'}
            </button>
        </form>
    </div>
  );
}

export default CreateCommunity;