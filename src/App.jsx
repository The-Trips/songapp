// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

import Login from './Login';
import Register from './Registration';
import CreateUsername from './CreateUsername';
import Homepage from './homepage';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Protected Route: Home */}
        <Route 
          path="/" 
          element={session ? <Homepage /> : <Navigate to="/login" />} 
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Create Username - Only accessible if you have a session (logged in) but no profile yet */}
        <Route 
          path="/create-username" 
          element={session ? <CreateUsername /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;