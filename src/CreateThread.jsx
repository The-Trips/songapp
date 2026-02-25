// CreateThread.jsx - CONNECTED TO API
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './threads.css';

////// Thread creation updated to connect API ///////////
function CreateThread() {
  const navigate = useNavigate();
  const { id: sceneId } = useParams(); // Extract 'id' from URL but keep using 'sceneId' in code
  const [username, setUsername] = useState('User');
  const [scene, setScene] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to start a thread');
      navigate('/login');
      return;
    }

    // Load scene data from API
    fetchScene();
  }, [sceneId, navigate]);

  const fetchScene = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/scenes/${sceneId}`);
      if (res.ok) {
        const data = await res.json();
        setScene(data);
      } else {
        alert('Scene not found');
        navigate('/scenes');
      }
    } catch (err) {
      console.error('Error fetching scene:', err);
      alert('Error loading scene');
      navigate('/scenes');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Validate content
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.trim().length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare payload for API (matching CreateThreadRequest schema)
    const payload = {
      title: formData.title.trim(),
      text: formData.content.trim(),
      username: username,
      scene_id: parseInt(sceneId)
    };

    try {
      // Send to API
      const res = await fetch('http://localhost:8000/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        // Navigate to the new thread
        navigate(`/scene/${sceneId}/thread/${data.id}`);
      } else {
        const errorData = await res.json();
        alert(`Failed to start thread: ${errorData.detail || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error starting thread:', err);
      alert('Error connecting to server');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/scene/${sceneId}`);
  };

  if (!scene) {
    return (
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ 
      padding: '20px', 
      color: 'white', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      
      {/* Back Button */}
      <button
        onClick={handleCancel}
        style={{
          background: 'transparent',
          border: '1px solid #444',
          color: '#ccc',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back to {scene.name}
      </button>

      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1>Start a Thread</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          in <span style={{ color: '#1db954', fontWeight: 'bold' }}>{scene.name}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* Thread Title */}
        <div style={{ marginBottom: '25px' }}>
          <label 
            htmlFor="thread-title"
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            Thread Title *
          </label>
          <input
            id="thread-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="What's on your mind?"
            maxLength={200}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.title ? '2px solid #e74c3c' : '1px solid #444',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '5px',
            fontSize: '0.85rem'
          }}>
            {errors.title ? (
              <span style={{ color: '#e74c3c' }}>{errors.title}</span>
            ) : (
              <span style={{ color: '#666' }}>Be clear and descriptive</span>
            )}
            <span style={{ color: '#666' }}>{formData.title.length}/200</span>
          </div>
        </div>

        {/* Thread Content */}
        <div style={{ marginBottom: '25px' }}>
          <label 
            htmlFor="thread-content"
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            Your Thoughts *
          </label>
          <textarea
            id="thread-content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Share your thoughts, ask questions, or start a conversation..."
            rows={8}
            maxLength={5000}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.content ? '2px solid #e74c3c' : '1px solid #444',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '200px'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '5px',
            fontSize: '0.85rem'
          }}>
            {errors.content ? (
              <span style={{ color: '#e74c3c' }}>{errors.content}</span>
            ) : (
              <span style={{ color: '#666' }}>Express yourself freely</span>
            )}
            <span style={{ color: '#666' }}>{formData.content.length}/5000</span>
          </div>
        </div>

        {/* Thread Guidelines */}
        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: '8px', 
          padding: '15px',
          marginBottom: '30px',
          maxWidth: '400px',
          margin: '0 auto 30px auto'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Thread Guidelines</h3>
          <ul style={{ 
            paddingLeft: '20px', 
            fontSize: '0.85rem', 
            color: '#aaa',
            lineHeight: '1.6',
            listStyle: 'none'
          }}>
            <li>Be respectful and constructive in your threads</li>
            <li>Stay on topic - keep threads related to {scene.name}</li>
            <li>No spam, self-promotion, or offensive content</li>
            <li>Use clear, descriptive titles for your threads</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#ccc',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: 'none',
              background: (isSubmitting || !formData.title.trim() || !formData.content.trim()) 
                ? '#444' 
                : '#1db954',
              color: (isSubmitting || !formData.title.trim() || !formData.content.trim()) 
                ? '#888' 
                : 'black',
              fontWeight: 'bold',
              cursor: (isSubmitting || !formData.title.trim() || !formData.content.trim()) 
                ? 'not-allowed' 
                : 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {isSubmitting ? 'Posting...' : 'Post Thread'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateThread;