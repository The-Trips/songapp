// src/Registration.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import './Registration.css';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: formData.name, 
            email: formData.email, 
            password: formData.password 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Registration failed');
      }

      // Success! Move to step 2: Create Username
      navigate('/create-username', { state: { email: formData.email } });
      
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
          <p className="reg-subtitle">Create your account to start your journey</p>
        </header>

        <div className="reg-step-indicator">
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
        </div>

        {error && (
          <div className="reg-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="reg-form">
          <div className="reg-input-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              className="reg-input"
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <User className="reg-input-icon" size={20} />
          </div>

          <div className="reg-input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
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

          <div className="reg-input-group">
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              className="reg-input"
              value={formData.confirmPassword} 
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
            {isSubmitting ? 'Processing...' : (
              <>
                Continue <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="reg-footer">
          Already have an account? 
          <Link to="/login" className="reg-login-link">Log in</Link>
        </footer>
      </div>
    </div>
  );
}

export default Registration;