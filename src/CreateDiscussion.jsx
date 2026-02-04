import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';
import Navbar from './Navbar';


function CreateDiscussion() {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const [username, setUsername] = useState('User');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('Album Title');

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // TODO: Fetch album title from API
    setAlbumTitle('Drake - New Album');
  }, [albumId]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);

    // Save to localStorage
    const newDiscussion = {
      id: Date.now(),
      title: title.trim(),
      author: username,
      content: content.trim(),
      replies: 0,
      lastActivity: 'Just now',
      preview: content.trim().substring(0, 100) + (content.length > 100 ? '...' : ''),
      createdAt: 'Just now',
      albumId: albumId
    };

    // Get existing discussions for this album
    const storageKey = `discussions_album_${albumId}`;
    const existingDiscussions = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Add new discussion to the beginning
    existingDiscussions.unshift(newDiscussion);

    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingDiscussions));

    // Also save the discussion details for the thread view
    localStorage.setItem(`discussion_${newDiscussion.id}`, JSON.stringify({
      discussion: newDiscussion,
      comments: []
    }));

    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate back to discussions list
      navigate(`/album/${albumId}/discussions`);
    }, 300);
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (window.confirm('Are you sure you want to discard this discussion?')) {
        navigate(`/album/${albumId}/discussions`);
      }
    } else {
      navigate(`/album/${albumId}/discussions`);
    }
  };

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>

        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="back-button"
        >
          ← Back to Discussions
        </button>

        <div className="create-discussion-header">
          <h1>Start a Discussion</h1>
          <p style={{ color: '#ccc', marginTop: '10px' }}>
            About: {albumTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-discussion-form">

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="discussion-title">Discussion Title</label>
            <input
              id="discussion-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is on your mind about this album?"
              maxLength={200}
              className="title-input"
              required
            />
            <span className="char-count">{title.length}/200</span>
          </div>

          {/* Content Input */}
          <div className="form-group">
            <label htmlFor="discussion-content">Your Thoughts</label>
            <textarea
              id="discussion-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              className="content-textarea"
              row={5}
              required
            />
            <span className="char-count">{content.length} characters</span>
          </div>


          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-action-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-discussion-btn"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>

        {/* Guidelines */}
        <div className="discussion-guidelines">
          <h4>Discussion Guidelines</h4>
          <ul>
            <li>Be respectful and constructive in your discussions</li>
            <li>Stay on topic - keep discussions related to the album</li>
            <li>No spam, self-promotion, or offensive content</li>
            <li>Use clear, descriptive titles for your discussions</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default CreateDiscussion;
