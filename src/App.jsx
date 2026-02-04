// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout'; 
import Login from './Login';
import Register from './Registration';
import CreateUsername from './CreateUsername';
import Homepage from './homepage';
import AlbumPage from './AlbumPage';
import ProfilePage from './ProfilePage';

// --- NEW IMPORTS FOR DISCUSSIONS ---
import DiscussionList from './DiscussionList';
import CreateDiscussion from './CreateDiscussion';
import DiscussionThread from './DiscussionThread';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />

        {/* Protected Routes (Wrapped in Layout) */}
        {isAuthenticated ? (
          <Route element={<Layout onLogout={handleLogout} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Album Page */}
            <Route path="/album/:id" element={<AlbumPage />} />

            {/* --- DISCUSSION ROUTES --- */}
            {/* List of discussions for a specific album */}
            <Route path="/album/:id/discussions" element={<DiscussionList />} />
            
            {/* Create a new discussion for an album */}
            <Route path="/album/:id/discussion/create" element={<CreateDiscussion />} />
            
            {/* View a specific discussion thread */}
            <Route path="/album/:id/discussion/:discussionId" element={<DiscussionThread />} />
            
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;