// src/CreateUsername.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AtSign, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import './Registration.css';

function CreateUsername() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If someone tries to access this page directly without registering, send them back
  useEffect(() => {
    if (!location.state || !location.state.email) {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const email = location.state?.email;

    try {
      const response = await fetch('http://localhost:8000/api/create-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            username: username 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create username');
      }

      // Success!
      navigate('/login', { state: { accountCreated: true } });
      
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
          <p className="reg-subtitle">Almost there! Finalize your profile</p>
        </header>

        <div className="reg-step-indicator">
          <div className="step-dot active"></div>
          <div className="step-dot active"></div>
        </div>

        {error && (
          <div className="reg-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="reg-form">
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>One Last Step</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              Pick a unique username for your profile.
            </p>
          </div>

          <div className="reg-input-group">
            <input 
              type="text" 
              placeholder="Username" 
              className="reg-input"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <AtSign className="reg-input-icon" size={20} />
          </div>

          <button 
            type="submit" 
            className="reg-next-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up...' : (
              <>
                Complete Setup <CheckCircle size={20} />
              </>
            )}
          </button>

          <div 
            style={{ 
              marginTop: '20px', 
              padding: '12px', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '10px',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <ShieldCheck size={16} />
            Your email is verified. This username will be your public identity.
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUsername;