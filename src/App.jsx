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
import CommunitiesList from "./CommunitiesList";
import CommunityDetail from "./CommunityDetail";
import CreateCommunity from "./CreateCommunity";
import CreateDiscussion from "./CreateDiscussion";
import DiscussionThread from "./DiscussionThread";
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

          {/* --- DISCUSSION ROUTES --- */}
          <Route path="/communities" element={<CommunitiesList />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          <Route
            path="/create-community"
            element={
              isAuthenticated ? <CreateCommunity /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/community/:communityId/discussion/:discussionId"
            element={<DiscussionThread />}
          />
          <Route
            path="/community/:id/create-discussion"
            element={
              isAuthenticated ? <CreateDiscussion /> : <Navigate to="/login" />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
