// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Login';
import Register from './Registration';
import CreateUsername from './CreateUsername';
import Homepage from './homepage';
import AlbumPage from './AlbumPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes are now static - no authentication required */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-username" element={<CreateUsername />} />
        
        {/* 2. Add the dynamic route for albums */}
        {/* The ":id" tells React this part of the URL is a variable (like 1, 2, or 3) */}
        <Route path="/album/:id" element={<AlbumPage />} />
      </Routes>
    </Router>
  );
}

export default App;