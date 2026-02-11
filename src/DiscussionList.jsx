import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';

const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0
  );
};

function DiscussionList({ isAuthenticated }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Changed from albumId to id to match Router
  const [discussions, setDiscussions] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('Album');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Album Title (Optional, for context)
    fetch(`http://localhost:8000/api/albums/${id}`)
        .then(res => res.json())
        .then(data => setAlbumTitle(data.title))
        .catch(() => setAlbumTitle("Unknown Album"));

    // 2. Load Discussions
    const storageKey = `discussions_album_${id}`;
    const savedDiscussions = localStorage.getItem(storageKey);

    if (savedDiscussions) {
      const discussionsData = JSON.parse(savedDiscussions);
      const updatedDiscussions = discussionsData.map(disc => {
        const discussionData = localStorage.getItem(`discussion_${disc.id}`);
        if (discussionData) {
          const { comments } = JSON.parse(discussionData);
          const totalReplies = comments.reduce((total, comment) => {
            return total + 1 + countReplies(comment.replies || []);
          }, 0);
          return { ...disc, replies: totalReplies };
        }
        return disc;
      });
      setDiscussions(updatedDiscussions);
    }
    setIsLoading(false);
  }, [id]);

  const handleCreateDiscussion = () => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    navigate(`/album/${id}/discussion/create`);
  };

  const handleDiscussionClick = (discussionId) => {
    navigate(`/album/${id}/discussion/${discussionId}`);
  };

  if (isLoading) return <div style={{padding:'40px', color:'white'}}>Loading...</div>;

  return (
    <div className="discussion-page-container" style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      
      <button onClick={() => navigate(`/album/${id}`)} className="back-button">
        ← Back to Album
      </button>

      <div className="discussion-header">
        <h1>Discussions: {albumTitle}</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          Share your thoughts and connect with other fans
        </p>
      </div>

      <button onClick={handleCreateDiscussion} className="create-discussion-btn">
        {isAuthenticated ? "+ Start a New Discussion" : "Log in to Start a Discussion"}
      </button>

      {discussions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>No discussions yet</h2>
          <p>Be the first to start a discussion about this album!</p>
          <button onClick={handleCreateDiscussion} className="primary-btn">
             {isAuthenticated ? "Start Discussion" : "Log in to Start Discussion"}
          </button>
        </div>
      ) : (
        <div className="discussions-container">
          {discussions.map((discussion) => (
            <div 
              key={discussion.id} 
              className="discussion-card"
              onClick={() => handleDiscussionClick(discussion.id)}
            >
              <div className="discussion-main">
                <h3 className="discussion-title">{discussion.title}</h3>
                <p className="discussion-preview">{discussion.preview}</p>
                <div className="discussion-meta">
                  <span className="author">
                    <span className="avatar">{discussion.author.charAt(0)}</span>
                    {discussion.author}
                  </span>
                  <span className="separator">•</span>
                  <span className="replies">{discussion.replies} replies</span>
                  <span className="separator">•</span>
                  <span className="time">{discussion.lastActivity}</span>
                </div>
              </div>
              <div className="discussion-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscussionList;