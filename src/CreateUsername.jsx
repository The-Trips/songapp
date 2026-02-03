// src/CreateUsername.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CreateUsername() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // If someone tries to access this page directly without registering, send them back
  useEffect(() => {
    if (!location.state || !location.state.email) {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = location.state?.email;

    try {
      const response = await fetch('http://localhost:8000/api/create-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            username: username 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create username');
      }

      // Success! Redirect to login
      alert("Account created successfully!");
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '10px', color: '#fff' }}>One Last Step</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>Pick a unique username for your profile.</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={styles.input} 
            required 
          />
          <button type="submit" style={styles.button}>Complete Setup</button>
        </form>
      </div>
    </div>
  );
}

// Reusing styles for consistency
const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: 'white' },
  card: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white', fontSize: '1rem' },
  button: { padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#770505', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#ff4444', marginBottom: '15px', fontSize: '0.9rem' }
};

export default CreateUsername;