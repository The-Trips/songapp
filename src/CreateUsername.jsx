// CreateUsername.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function CreateUsername() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email passed from Registration page
  const email = location.state?.email;

  const handleCreateUsername = async (e) => {
    e.preventDefault();
    if(!email) {
        alert("Error: No email found. Please register again.");
        navigate('/register');
        return;
    }
    setLoading(true);

    try {
        const response = await fetch('http://localhost:8000/api/create-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, username: username })
        });

        if (response.ok) {
            alert("Account created! Please log in.");
            navigate('/login');
        } else {
            const err = await response.json();
            alert(err.detail || "Failed to create username");
        }
    } catch (error) {
        alert("Network error");
    } finally {
        setLoading(false);
    }
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