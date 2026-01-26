// CreateUsername.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './App.css';

function CreateUsername() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("No user found. Please register first.");
      navigate('/register');
      return;
    }

    // 2. Insert into the profiles table
    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: user.id, 
          username: username,
          full_name: user.user_metadata.full_name // pulling name from registration metadata
        }
      ]);

    if (error) {
      console.error(error);
      alert("Error: " + error.message);
    } else {
      // 3. Success! Redirect to Login page as requested
      alert("Username created! Please log in.");
      navigate('/login');
    }
    setLoading(false);
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