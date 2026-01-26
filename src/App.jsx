// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Login';
import Register from './Registration';
import CreateUsername from './CreateUsername';
import Homepage from './homepage';
import AlbumPage from './AlbumPage'; // Import the Album Page
import './App.css';

function App() {
  // We are simulating a logged-in state. 
  // In a real app without Supabase, you might check localStorage here.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);

  return (
    <Router>
      <Routes>
        {/* Main Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Homepage /> : <Login onLogin={handleLogin} />} 
        />
        
        {/* Connect Album Page */}
        <Route path="/album" element={<AlbumPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />
      </Routes>
    </Router>
  );
}

export default App;