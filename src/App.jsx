// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import Register from "./Registration";
import CreateUsername from "./CreateUsername";
import Homepage from "./homepage";
import AlbumPage from "./AlbumPage";
import ProfilePage from "./ProfilePage";
import ScenesList from "./ScenesList";
import SceneDetail from "./SceneDetail";
import CreateScene from "./CreateScene";
import CreateThread from "./CreateThread";
import ThreadDetail from "./ThreadDetail";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("app_username", "");
    setIsAuthenticated(false);
  };

  if (loading) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="/create-username" element={<CreateUsername />} />

        {/* Main Routes (Accessible by everyone) */}
        <Route
          element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated} />
          }
        >
          <Route path="/" element={<Homepage />} />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProfilePage onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Album Page */}
          <Route
            path="/album/:id"
            element={<AlbumPage isAuthenticated={isAuthenticated} />}
          />

          {/* --- SCENE & THREAD ROUTES --- */}
          <Route path="/scenes" element={<ScenesList />} />
          <Route path="/scene/:id" element={<SceneDetail />} />
          <Route
            path="/create-scene"
            element={
              isAuthenticated ? <CreateScene /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/scene/:sceneId/thread/:threadId"
            element={<ThreadDetail />}
          />
          <Route
            path="/scene/:id/create-thread"
            element={
              isAuthenticated ? <CreateThread /> : <Navigate to="/login" />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
