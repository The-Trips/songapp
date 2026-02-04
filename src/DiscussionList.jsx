import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';
import Navbar from './Navbar';


const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0
  );
};

function DiscussionList() {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const [username, setUsername] = useState('User');
  const [discussions, setDiscussions] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('Album Title');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // Load discussions from localStorage for this specific album
    const storageKey = `discussions_album_${albumId}`;
    const savedDiscussions = localStorage.getItem(storageKey);

    if (savedDiscussions) {
      // Calculate accurate reply counts from actual discussion data
      const discussionsData = JSON.parse(savedDiscussions);
      const updatedDiscussions = discussionsData.map(disc => {
        // Get the actual discussion data with comments
        const discussionData = localStorage.getItem(`discussion_${disc.id}`);
        if (discussionData) {
          const { comments } = JSON.parse(discussionData);
          // Use the same countReplies logic
          const totalReplies = comments.reduce((total, comment) => {
            return total + 1 + countReplies(comment.replies || []);
          }, 0);
          return { ...disc, replies: totalReplies };
        }
        return disc;
      });
      setDiscussions(updatedDiscussions);
    } else {
      // ... rest of your mock data code stays the same
    }

    setAlbumTitle('Drake - New Album');
    setIsLoading(false);
  }, [albumId]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleCreateDiscussion = () => {
    navigate(`/album/${albumId}/discussion/create`);
  };

  const handleDiscussionClick = (discussionId) => {
    navigate(`/album/${albumId}/discussion/${discussionId}`);
  };

  if (isLoading) {
    return (
      <>
        <Navbar onLogout={handleLogout} />
        <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
          <p>Loading discussions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/album/${albumId}`)} 
          className="back-button"
        >
          ← Back to Album
        </button>

        {/* rest of your existing code stays exactly the same */}
        <div className="discussion-header">
          <h1>Discussions about {albumTitle}</h1>
          <p style={{ color: '#ccc', marginTop: '10px' }}>
            Share your thoughts and connect with other fans
          </p>
        </div>

        <button 
          onClick={handleCreateDiscussion}
          className="create-discussion-btn"
        >
          + Start a New Discussion
        </button>

        {discussions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>No discussions yet</h2>
            <p>Be the first to start a discussion about this album!</p>
            <button onClick={handleCreateDiscussion} className="primary-btn">
              Start Discussion
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
    </>
  );
}

export default DiscussionList;
