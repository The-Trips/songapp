import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './threads.css';

const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0
  );
};

function ThreadList({ isAuthenticated }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Changed from albumId to id to match Router
  const [threads, setThreads] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('Album');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Album Title (Optional, for context)
    fetch(`http://localhost:8000/api/albums/${id}`)
        .then(res => res.json())
        .then(data => setAlbumTitle(data.title))
        .catch(() => setAlbumTitle("Unknown Album"));

    // 2. Load Threads
    const storageKey = `threads_album_${id}`;
    const savedThreads = localStorage.getItem(storageKey);

    if (savedThreads) {
      const threadsData = JSON.parse(savedThreads);
      const updatedThreads = threadsData.map(thread => {
        const threadData = localStorage.getItem(`thread_${thread.id}`);
        if (threadData) {
          const { comments } = JSON.parse(threadData);
          const totalReplies = comments.reduce((total, comment) => {
            return total + 1 + countReplies(comment.replies || []);
          }, 0);
          return { ...thread, replies: totalReplies };
        }
        return thread;
      });
      setThreads(updatedThreads);
    }
    setIsLoading(false);
  }, [id]);

  const handleCreateThread = () => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    navigate(`/album/${id}/thread/create`);
  };

  const handleThreadClick = (threadId) => {
    navigate(`/album/${id}/thread/${threadId}`);
  };

  if (isLoading) return <div style={{padding:'40px', color:'white'}}>Loading...</div>;

  return (
    <div className="thread-page-container" style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      
      <button onClick={() => navigate(`/album/${id}`)} className="back-button">
        ← Back to Album
      </button>

      <div className="thread-header">
        <h1>Threads: {albumTitle}</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          Share your thoughts and connect with other fans
        </p>
      </div>

      <button onClick={handleCreateThread} className="create-thread-btn">
        {isAuthenticated ? "+ Start a New Thread" : "Log in to Start a Thread"}
      </button>

      {threads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>No threads yet</h2>
          <p>Be the first to start a thread about this album!</p>
          <button onClick={handleCreateThread} className="primary-btn">
             {isAuthenticated ? "Start Thread" : "Log in to Start Thread"}
          </button>
        </div>
      ) : (
        <div className="threads-container">
          {threads.map((thread) => (
            <div 
              key={thread.id} 
              className="thread-card"
              onClick={() => handleThreadClick(thread.id)}
            >
              <div className="thread-main">
                <h3 className="thread-title">{thread.title}</h3>
                <p className="thread-preview">{thread.preview}</p>
                <div className="thread-meta">
                  <span className="author">
                    <span className="avatar">{thread.author.charAt(0)}</span>
                    {thread.author}
                  </span>
                  <span className="separator">•</span>
                  <span className="replies">{thread.replies} replies</span>
                  <span className="separator">•</span>
                  <span className="time">{thread.lastActivity}</span>
                </div>
              </div>
              <div className="thread-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThreadList;