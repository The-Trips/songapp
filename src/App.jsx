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

// Imported Communities
import CommunitiesList from './CommunitiesList';
import CommunityDetail from './CommunityDetail';
import CreateCommunity from './CreateCommunity';

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
        {/* Public Routes (Login/Register) */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />

        {/* Public Routes (Wrapped in Layout, browsing allowed) */}
       <Route element={<Layout onLogout={handleLogout} isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          
          {/* Community browsing - public */}
          <Route path="/communities" element={<CommunitiesList />} />
          <Route path="/community/:communityId" element={<CommunityDetail />} />
          
          {/* Discussion browsing - public */}
          <Route path="/album/:id/discussions" element={<DiscussionList />} />
          <Route path="/community/:communityId/discussion/:discussionId" element={<DiscussionThread />} />
          <Route path="/album/:id/discussion/:discussionId" element={<DiscussionThread />} />

          {/* Protected Routes - require authentication */}
          {isAuthenticated ? (
            <>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/community/create" element={<CreateCommunity />} />
              <Route path="/community/:communityId/discussion/create" element={<CreateDiscussion />} />
              <Route path="/album/:id/discussion/create" element={<CreateDiscussion />} />
            </>
          ) : (
            <>
              {/* Redirect creation routes to login */}
              <Route path="/profile" element={<Navigate to="/login" replace/>} />
              <Route path="/community/create" element={<Navigate to="/login" replace/>} />
              <Route path="/community/:communityId/discussion/create" element={<Navigate to="/login" />} />
              <Route path="/album/:id/discussion/create" element={<Navigate to="/login" />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;