// src/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Handle "Incomplete" account (Registered but didn't pick username)
      if (data.status === 'incomplete') {
         navigate('/create-username', { state: { email: data.email } });
         return;
      }

      // Success: Save data for the app to use
      localStorage.setItem('app_username', data.username);
      
      // Trigger App.jsx state update
      onLogin(); 
      
      navigate('/');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '20px', color: '#fff' }}>Welcome Back</h2>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            style={styles.input} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            style={styles.input} 
            required 
          />
          <button type="submit" style={styles.button}>Log In</button>
        </form>

        <p style={{ marginTop: '15px', color: '#aaa' }}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: 'white' },
  card: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#222', color: 'white', fontSize: '1rem' },
  button: { padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#770505', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#ff4444', marginBottom: '15px', fontSize: '0.9rem' },
  link: { color: '#fff', textDecoration: 'underline' }
};

export default Login;