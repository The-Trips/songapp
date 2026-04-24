// src/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Key,
  ShieldCheck,
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import './Registration.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Email not found');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: token.toUpperCase() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Invalid code');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          token: token.toUpperCase(), 
          new_password: passwords.new 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Update failed');
      
      alert("Password updated successfully!");
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
          <div className="reg-logo">Reset Password</div>
          <p className="reg-subtitle">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && `Enter the code sent to ${email}`}
            {step === 3 && "Create your new secure password"}
          </p>
        </header>

        <div className="reg-step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {error && (
          <div className="reg-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode} className="reg-form">
            <div className="reg-input-group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="reg-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <Mail className="reg-input-icon" size={20} />
            </div>
            <button type="submit" className="reg-next-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : <>Send Reset Code <ArrowRight size={20} /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="reg-form">
            <div className="reg-input-group">
              <input 
                type="text" 
                placeholder="6-Character Code" 
                className="reg-input"
                style={{ textAlign: 'center', letterSpacing: '4px', textTransform: 'uppercase'}}
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required 
              />
              <Key className="reg-input-icon" size={20} />
            </div>
            <button type="submit" className="reg-next-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : <>Verify Code <ShieldCheck size={20} /></>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="reg-form">
            <div className="reg-input-group">
              <input 
                type="password" 
                placeholder="New Password" 
                className="reg-input"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                required 
              />
              <Lock className="reg-input-icon" size={20} />
            </div>
            <div className="reg-input-group">
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                className="reg-input"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required 
              />
              <Lock className="reg-input-icon" size={20} />
            </div>
            <button type="submit" className="reg-next-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : <>Update Password <CheckCircle2 size={20} /></>}
            </button>
          </form>
        )}

        <footer className="reg-footer">
          Remember your password? 
          <Link to="/login" className="reg-login-link">Log in</Link>
        </footer>
      </div>
    </div>
  );
}

export default ForgotPassword;
