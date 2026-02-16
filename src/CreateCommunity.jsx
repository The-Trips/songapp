import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './discussions.css';
//////// Community creation connected to API ///////
function CreateCommunity() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
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
      alert('Please log in to create a community');
      navigate('/login');
    }
  }, [navigate]);

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

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Community name must be less than 100 characters';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate image URL (optional, but must be valid if provided)
    if (formData.imageUrl.trim() && !isValidUrl(formData.imageUrl.trim())) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image_url: formData.imageUrl.trim() || null,
      username: username
    };

    try {
      const res = await fetch('http://localhost:8000/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();

        // Auto-join the community (localStorage for now)
        const savedJoined = localStorage.getItem(`joined_communities_${username}`) || '[]';
        const joinedList = JSON.parse(savedJoined);
        joinedList.push(data.id);
        localStorage.setItem(`joined_communities_${username}`, JSON.stringify(joinedList));

        // Navigate to new community
        navigate(`/community/${data.id}`);
      } else {
        alert("Failed to create community");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/communities');
  };

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
        ← Back to Communities
      </button>

      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1>Create a Community</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          Build a space for fans to connect and discuss music
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        {/* Community Name */}
        <div style={{ marginBottom: '25px' }}>
          <label
            htmlFor="community-name"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            Community Name *
          </label>
          <input
            id="community-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Taylor Swift Fans, Jazz Lovers, 90s Hip Hop"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.name ? '2px solid #e74c3c' : '1px solid #444',
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
            {errors.name ? (
              <span style={{ color: '#e74c3c' }}>{errors.name}</span>
            ) : (
              <span style={{ color: '#666' }}>Choose a unique, descriptive name</span>
            )}
            <span style={{ color: '#666' }}>{formData.name.length}/100</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '25px' }}>
          <label
            htmlFor="community-description"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            Description *
          </label>
          <textarea
            id="community-description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this community is about, what topics will be discussed, and who should join..."
            rows={5}
            maxLength={500}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.description ? '2px solid #e74c3c' : '1px solid #444',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '120px'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '0.85rem'
          }}>
            {errors.description ? (
              <span style={{ color: '#e74c3c' }}>{errors.description}</span>
            ) : (
              <span style={{ color: '#666' }}>Tell members what to expect</span>
            )}
            <span style={{ color: '#666' }}>{formData.description.length}/500</span>
          </div>
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '30px' }}>
          <label
            htmlFor="community-image"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
          >
            Community Image URL (Optional)
          </label>
          <input
            id="community-image"
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.imageUrl ? '2px solid #e74c3c' : '1px solid #444',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
          {errors.imageUrl ? (
            <span style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
              {errors.imageUrl}
            </span>
          ) : (
            <span style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
              Add a banner image to make your community stand out
            </span>
          )}

          {/* Image Preview */}
          {formData.imageUrl && !errors.imageUrl && isValidUrl(formData.imageUrl) && (
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '8px' }}>Preview:</p>
              <div style={{
                width: '200px',
                height: '200px',
                background: `url(${formData.imageUrl}) center/cover`,
                borderRadius: '8px',
                border: '1px solid #333'
              }}></div>
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '5px',
          marginBottom: '30px',
          maxWidth: '400px',
          margin: '0 auto 30px auto'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Community Guidelines</h3>
          <ul style={{
            paddingLeft: '20px',
            fontSize: '0.9rem',
            color: '#aaa',
            lineHeight: '1.6',
            listStyle: 'none'
          }}>
            <li>Keep discussions respectful and on-topic</li>
            <li>No spam, self-promotion, or offensive content</li>
            <li>Welcome all members and encourage participation</li>
            <li>Communities that violate guidelines may be removed</li>
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
            disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: 'none',
              background: (isSubmitting || !formData.name.trim() || !formData.description.trim())
                ? '#444'
                : '#1db954',
              color: (isSubmitting || !formData.name.trim() || !formData.description.trim())
                ? '#888'
                : 'black',
              fontWeight: 'bold',
              cursor: (isSubmitting || !formData.name.trim() || !formData.description.trim())
                ? 'not-allowed'
                : 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCommunity;