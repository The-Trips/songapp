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
import CommunitiesList from './CommunitiesList'; // NEW
import CommunityDetail from './CommunityDetail'; // NEW
import CreateCommunity from './CreateCommunity'; // NEW
import CreateDiscussion from './CreateDiscussion'; // NEW
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
    localStorage.removeItem('app_username');
    setIsAuthenticated(false);
  };

  if (loading) return <div style={{color:'white'}}>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />

        <Route element={<Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            
            {/* NEW COMMUNITY ROUTES */}
            <Route path="/communities" element={<CommunitiesList />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            <Route path="/create-community" element={isAuthenticated ? <CreateCommunity /> : <Navigate to="/login" />} />
            <Route path="/community/:id/create-discussion" element={isAuthenticated ? <CreateDiscussion /> : <Navigate to="/login" />} />

            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;