// CreateUsername.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function CreateUsername() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateUsername = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate saving to DB
    setTimeout(() => {
        // Save to local storage for the demo
        localStorage.setItem('app_username', username);
        
        alert("Username created! Please log in.");
        navigate('/login');
        setLoading(false);
    }, 500);
  };

  return (
    <div className="card">
      <h2>Create a Username</h2>
      <p>Choose a unique handle for your profile.</p>
      <form onSubmit={handleCreateUsername} className="App">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Set Username'}
        </button>
      </form>
    </div>
  );
}

export default CreateUsername;