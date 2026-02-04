import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';
import Navbar from './Navbar';


//Counts nested replies for a comment
const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0
  );
};


const RenderReplies = ({
  replies,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyInputs,
  handleReplyInputChange,
  handlePostReply,
  handleCancelReply,
  username,
  maxDepth = 3
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="replies-container">
      {replies.map((reply) => (
        <div key={reply.id} className="reply-item">
          <div className="reply-header">
            <span className="reply-avatar">{reply.author.charAt(0)}</span>
            <span className="reply-author">{reply.author}</span>
            <span className="separator">•</span>
            <span className="reply-time">{reply.createdAt}</span>
          </div>

          <div className="reply-content">
            <p>{reply.content}</p>
          </div>

          {/* Reply button only if under maxDepth */}
          {depth < maxDepth ? (
            <button
              className="reply-btn"
              onClick={() =>
                setReplyingTo(replyingTo === reply.id ? null : reply.id)
              }
            >
              💬 Reply
            </button>
          ) : (
            <span style={{ color: '#888', fontSize: '0.9em', display: 'block', marginTop: '5px' }}>
              Cannot reply further here.
            </span>
          )}

          {/* Reply input only if replying and under maxDepth */}
          {replyingTo === reply.id && depth < maxDepth && (
            <div className="reply-input-container">
              <div className="user-avatar small">{username.charAt(0)}</div>
              <div className="input-wrapper">
                <textarea
                  value={replyInputs[reply.id] || ''}
                  onChange={(e) =>
                    handleReplyInputChange(reply.id, e.target.value)
                  }
                  placeholder={`Reply to ${reply.author}...`}
                  className="reply-textarea"
                  rows={3}
                />
                <div className="reply-actions">
                  <button
                    onClick={() => handlePostReply(reply.id, depth)}
                    disabled={!replyInputs[reply.id]?.trim()}
                    className="post-reply-btn"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => handleCancelReply(reply.id)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recursive call */}
          <RenderReplies
            replies={reply.replies || []}
            depth={depth + 1}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyInputs={replyInputs}
            handleReplyInputChange={handleReplyInputChange}
            handlePostReply={handlePostReply}
            handleCancelReply={handleCancelReply}
            username={username}
            maxDepth={maxDepth}
          />
        </div>
      ))}
    </div>
  );
};


function DiscussionThread() {

  const MAX_DEPTH = 3;
  const navigate = useNavigate();
  const { albumId, discussionId } = useParams();
  const [username, setUsername] = useState('User');
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({}); // Separate state for each reply

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // Load discussion and comments from localStorage
    const savedData = localStorage.getItem(`discussion_${discussionId}`);

    if (savedData) {
      const data = JSON.parse(savedData);
      setDiscussion(data.discussion);
      setComments(data.comments || []);
    } else {
      // Mock data if not found
      const mockDiscussion = {
        id: discussionId,
        title: 'What is your favorite track on this album?',
        author: 'MusicFan42',
        content: 'I think track 3 really showcases the artist\'s range and versatility. The production on that track is incredible, and the lyrics hit differently every time I listen. What do you all think?',
        createdAt: '2 days ago',
        albumTitle: 'Drake - New Album'
      };

      const mockComments = [
        {
          id: 1,
          author: 'JazzLover',
          content: 'I completely agree! Track 3 is my favorite too. The way the beat drops at 1:30 gives me chills every time.',
          createdAt: '1 day ago',
          replies: [
            {
              id: 101,
              author: 'MusicFan42',
              content: 'Yes! That drop is insane. Glad someone else noticed it.',
              createdAt: '1 day ago',
              replies: []
            }
          ]
        },
        {
          id: 2,
          author: 'NewListener',
          content: 'I\'m new to this artist. Can someone explain what makes track 3 so special?',
          createdAt: '12 hours ago',
          replies: []
        }
      ];

      setDiscussion(mockDiscussion);
      setComments(mockComments);

      // Save to localStorage
      localStorage.setItem(`discussion_${discussionId}`, JSON.stringify({
        discussion: mockDiscussion,
        comments: mockComments
      }));
    }
  }, [discussionId]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const totalCommentCount = comments.reduce((total, comment) => {
    return total + 1 + countReplies(comment.replies || []);
  }, 0);

  const saveToLocalStorage = (updatedComments) => {
    localStorage.setItem(`discussion_${discussionId}`, JSON.stringify({
      discussion,
      comments: updatedComments
    }));
  };

  const handlePostComment = () => {
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      author: username,
      content: commentInput,
      createdAt: 'Just now',
      replies: []
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveToLocalStorage(updatedComments);
    setCommentInput('');
  };

  // Recursive function to add reply to nested structure
  const addReplyToComment = (comments, targetId, newReply) => {
    return comments.map(comment => {
      if (comment.id === targetId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, targetId, newReply)
        };
      }
      return comment;
    });
  };

  const handlePostReply = (parentId, currentDepth) => {
    if (!replyInputs[parentId]?.trim()) return;

    if (currentDepth >= MAX_DEPTH) return; // block posting beyond maxDepth

    const newReply = {
      id: Date.now(),
      author: username,
      content: replyInputs[parentId],
      createdAt: 'Just now',
      replies: []
    };

    const updatedComments = addReplyToComment(comments, parentId, newReply);
    setComments(updatedComments);
    saveToLocalStorage(updatedComments);

    setReplyInputs(prev => ({ ...prev, [parentId]: '' }));
    setReplyingTo(null);
  };

  const handleReplyInputChange = (parentId, value) => {
    setReplyInputs(prev => ({ ...prev, [parentId]: value }));
  };

  const handleCancelReply = (parentId) => {
    setReplyInputs(prev => ({ ...prev, [parentId]: '' }));
    setReplyingTo(null);
  };


  if (!discussion) {
    return (
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
        <p>Loading discussion...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/album/${albumId}/discussions`)}
          className="back-button"
        >
          ← Back to Discussions
        </button>

        {/* Discussion Header */}
        <div className="thread-header">
          <h1>{discussion.title}</h1>
          <div className="thread-meta">
            <span className="avatar">{discussion.author.charAt(0)}</span>
            <span className="author-name">{discussion.author}</span>
            <span className="separator">•</span>
            <span className="time">{discussion.createdAt}</span>
          </div>
        </div>

        {/* Original Post */}
        <div className="original-post">
          <p>{discussion.content}</p>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3>{totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}</h3>

          {/* Add Comment Input */}
          <div className="comment-input-container">
            <div className="user-avatar">{username.charAt(0)}</div>
            <div className="input-wrapper">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts..."
                className="comment-textarea"
              />
              <button
                onClick={handlePostComment}
                disabled={!commentInput.trim()}
                className="post-comment-btn"
              >
                Post Comment
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-avatar">{comment.author.charAt(0)}</span>
                  <span className="comment-author">{comment.author}</span>
                  <span className="separator">•</span>
                  <span className="comment-time">{comment.createdAt}</span>
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
                <button
                  className="reply-btn"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  💬 Reply
                </button>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="reply-input-container">
                    <div className="user-avatar small">{username.charAt(0)}</div>
                    <div className="input-wrapper">
                      <textarea
                        value={replyInputs[comment.id] || ''}
                        onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                        placeholder={`Reply to ${comment.author}...`}
                        className="reply-textarea"
                      />
                      <div className="reply-actions">
                        <button
                          onClick={() => handlePostReply(comment.id, 1)}
                          disabled={!replyInputs[comment.id]?.trim()}
                          className="post-reply-btn"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => handleCancelReply(comment.id)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <RenderReplies
                  replies={comment.replies}
                  depth={1} // starting depth
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyInputs={replyInputs}
                  handleReplyInputChange={handleReplyInputChange}
                  handlePostReply={handlePostReply}
                  handleCancelReply={handleCancelReply}
                  username={username}
                />

              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default DiscussionThread;
