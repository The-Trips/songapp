// src/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import './Registration.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we just came from account creation success
  const successMessage = location.state?.accountCreated 
    ? "Account created successfully! Please log in." 
    : "";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Handle "Incomplete" account (Registered but didn't pick username)
      if (data.status === "incomplete") {
        navigate("/create-username", { state: { email: data.email } });
        return;
      }

      // Success
      localStorage.setItem("app_username", data.username);
      onLogin();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reg-page-wrapper">
      <div className="reg-card">
        <header className="reg-header">
          <div className="reg-logo">SongApp</div>
          <p className="reg-subtitle">Welcome back! Sign in to continue</p>
        </header>

        {successMessage && (
          <div 
            style={{ 
              background: 'rgba(29, 185, 84, 0.1)', 
              border: '1px solid rgba(29, 185, 84, 0.2)', 
              color: '#4ade80',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="reg-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="reg-input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="reg-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Mail className="reg-input-icon" size={20} />
          </div>

          <div className="reg-input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="reg-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Lock className="reg-input-icon" size={20} />
          </div>

          <button 
            type="submit" 
            className="reg-next-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : (
              <>
                Log In <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="reg-footer">
          Don't have an account?{" "}
          <Link to="/register" className="reg-login-link">
            Sign up
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default Login;
