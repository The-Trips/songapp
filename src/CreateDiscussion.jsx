import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';

function CreateDiscussion() {
  const navigate = useNavigate();
  const { id } = useParams(); // Changed from albumId to id
  const [username, setUsername] = useState('User');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);
    else {
        alert("Please login to post.");
        navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const newDiscussion = {
      id: Date.now(),
      title: title.trim(),
      author: username,
      content: content.trim(),
      replies: 0,
      lastActivity: 'Just now',
      preview: content.trim().substring(0, 100) + (content.length > 100 ? '...' : ''),
      createdAt: 'Just now',
      albumId: id
    };

    const storageKey = `discussions_album_${id}`;
    const existingDiscussions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingDiscussions.unshift(newDiscussion);
    localStorage.setItem(storageKey, JSON.stringify(existingDiscussions));

    localStorage.setItem(`discussion_${newDiscussion.id}`, JSON.stringify({
      discussion: newDiscussion,
      comments: []
    }));

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/album/${id}/discussions`);
    }, 300);
  };

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/album/${id}/discussions`)} className="back-button">
        ← Cancel
      </button>

      <div className="create-discussion-header">
        <h1>Start a Discussion</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-discussion-form">
        <div className="form-group">
          <label>Discussion Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is on your mind?"
            maxLength={200}
            className="title-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Your Thoughts</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="content-textarea"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-discussion-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateDiscussion;