// CreateUsername.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function CreateUsername() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateUsername = (e) => {
    e.preventDefault();
    // Static form - just show a message and navigate
    alert(`Username "${username}" submitted (static page - no database)`);
    navigate('/login');
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
        <button type="submit">
          Set Username
        </button>
      </form>
    </div>
  );
}

export default CreateUsername;