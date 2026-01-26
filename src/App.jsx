// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Registration';
import CreateUsername from './CreateUsername';
import Homepage from './homepage';
import AlbumPage from './AlbumPage'; // <--- IMPORT THIS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
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
        {/* Home Route */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Homepage onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* --- ADD THIS ROUTE FOR THE ALBUM PAGE --- */}
        <Route 
          path="/album" 
          element={isAuthenticated ? <AlbumPage /> : <Navigate to="/login" />} 
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />
      </Routes>
    </Router>
  );
}

export default App;
