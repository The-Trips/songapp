// src/Verification.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Key
} from 'lucide-react';
import './Registration.css'; // Reuse registration styles

function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no email in state, something went wrong
  if (!email) {
    return (
        <div className="reg-page-wrapper">
            <div className="reg-card">
                 <header className="reg-header">
                    <div className="reg-logo">Error</div>
                    <p className="reg-subtitle">No email found for verification. Please start over.</p>
                </header>
                <Link to="/register" className="reg-next-btn" style={{textDecoration: 'none'}}>
                    Back to Signup
                </Link>
            </div>
        </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (token.length !== 6) {
      setError("Please enter the 6-character code");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            token: token.toUpperCase() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      // Success! Account created. Store username and log them in? 
      // For now, redirect to login
      alert("Verification successful! You can now log in.");
      navigate('/login');
      
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
          <div className="reg-logo">Verify Email</div>
          <p className="reg-subtitle">We've sent a 6-character code to <strong>{email}</strong></p>
        </header>

        <div className="reg-step-indicator">
          <div className="step-dot"></div>
          <div className="step-dot active"></div>
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
              name="token" 
              placeholder="Enter Code" 
              className="reg-input"
              style={{ textAlign: 'center', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '1.2rem'}}
              maxLength={6}
              value={token} 
              onChange={(e) => setToken(e.target.value)} 
              required 
            />
            <Key className="reg-input-icon" size={20} />
          </div>

          <button 
            type="submit" 
            className="reg-next-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : (
              <>
                Verify Account <ShieldCheck size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="reg-footer">
          Didn't receive a code? 
          <button 
            onClick={() => alert("Check your console (backend logs) for the mock code!")}
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px'}}
          >
            Resend
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Verification;
