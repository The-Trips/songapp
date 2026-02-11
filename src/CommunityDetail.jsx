// CommunityDetail.jsx connected to Database
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './discussions.css';

const API_URL = 'http://localhost:8000';

function CommunityDetail() {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [username, setUsername] = useState('User');
  const [community, setCommunity] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'oldest'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // Fetch community and discussions from database
    fetchCommunityData();

    // Check if user has joined this community (still using localStorage for now)
    const savedJoined = localStorage.getItem(`joined_communities_${storedUser}`);
    if (savedJoined) {
      const joinedList = JSON.parse(savedJoined);
      setIsJoined(joinedList.includes(parseInt(communityId)));
    }
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      // Fetch community details
      const communityResponse = await fetch(`${API_URL}/api/scenes/${communityId}`);
      if (!communityResponse.ok) {
        setIsLoading(false);
        return;
      }
      const communityData = await communityResponse.json();

      // Transform to match component format
      const transformedCommunity = {
        id: communityData.id,
        name: communityData.name,
        description: communityData.description,
        imageUrl: communityData.imageUrl,
        isOfficial: communityData.isOfficial,
        members: communityData.members,
        createdBy: communityData.createdBy,
        albumId: null // You can add this field to the database if needed
      };

      setCommunity(transformedCommunity);

      // Fetch discussions/threads for this community
      const threadsResponse = await fetch(`${API_URL}/api/scenes/${communityId}/threads`);
      const threadsData = await threadsResponse.json();

      // Transform threads to match component format
      const transformedDiscussions = threadsData.threads.map(thread => ({
        id: thread.id,
        communityId: parseInt(communityId),
        title: thread.title,
        author: thread.author,
        content: thread.content,
        upvotes: thread.upvotes,
        commentCount: thread.commentCount,
        createdAt: thread.createdAt,
        isPinned: false
      }));

      setDiscussions(transformedDiscussions);
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching community data:', error);
      setIsLoading(false);
    }
  };

  const handleJoinToggle = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to join communities');
      navigate('/login');
      return;
    }

    const storedUser = localStorage.getItem('app_username');
    const savedJoined = localStorage.getItem(`joined_communities_${storedUser}`) || '[]';
    let joinedList = JSON.parse(savedJoined);

    if (isJoined) {
      // Leave community
      joinedList = joinedList.filter(id => id !== parseInt(communityId));
      
      // Update local member count
      setCommunity(prev => ({ ...prev, members: prev.members - 1 }));
    } else {
      // Join community
      joinedList.push(parseInt(communityId));
      
      // Update local member count
      setCommunity(prev => ({ ...prev, members: prev.members + 1 }));
    }

    localStorage.setItem(`joined_communities_${storedUser}`, JSON.stringify(joinedList));
    setIsJoined(!isJoined);

    // TODO: In the future, save join/leave to database
    // await fetch(`${API_URL}/api/scenes/${communityId}/join`, { method: 'POST' });
  };

  const handleCreateDiscussion = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to create a discussion');
      navigate('/login');
      return;
    }
    navigate(`/community/${communityId}/discussion/create`);
  };

  const handleDiscussionClick = (discussionId) => {
    navigate(`/community/${communityId}/discussion/${discussionId}`);
  };

  const handleGoToAlbum = () => {
    if (community && community.albumId) {
      navigate(`/album/${community.albumId}`);
    }
  };

  const getSortedDiscussions = () => {
    let sorted = [...discussions];
    
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.upvotes - a.upvotes);
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
        <p>Loading community...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
        <h2>Community not found</h2>
        <button onClick={() => navigate('/communities')} style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#1db954', 
          border: 'none', 
          borderRadius: '20px', 
          color: 'black', 
          fontWeight: 'bold', 
          cursor: 'pointer' 
        }}>
          Back to Communities
        </button>
      </div>
    );
  }

  const sortedDiscussions = getSortedDiscussions();

  return (
    <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/communities')}
        className="back-button"
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

      {/* Community Header */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        position: 'relative'
      }}>
        
        {/* Official Badge */}
        {community.isOfficial && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#1db954',
            color: 'black',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            ✓ OFFICIAL
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          {/* Community Image */}
          <div style={{
            width: '150px',
            height: '150px',
            minWidth: '150px',
            background: community.imageUrl 
              ? `url(${community.imageUrl}) center/cover` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}></div>

          {/* Community Info */}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'left' }}>{community.name}</h1>
            <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '20px', lineHeight: '1.5', textAlign: 'left' }}>{community.description}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '20px', fontSize: '0.95rem', color: '#888' }}>
              <span>👥 {community.members?.toLocaleString() || 0} members</span>
              <span>💬 {discussions.length} discussions</span>
              <span>📅 Created by {community.createdBy || 'Unknown'}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={handleJoinToggle}
                style={{
                  padding: '10px 24px',
                  borderRadius: '25px',
                  border: isJoined ? '2px solid #1db954' : 'none',
                  background: isJoined ? 'transparent' : '#1db954',
                  color: isJoined ? '#1db954' : 'black',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                {isJoined ? '✓ Joined' : '+ Join Community'}
              </button>

              {community.isOfficial && community.albumId && (
                <button
                  onClick={handleGoToAlbum}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '25px',
                    border: '1px solid #444',
                    background: 'transparent',
                    color: '#ccc',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  🎵 View Album
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discussions Section */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Discussions</h2>
        <button
          onClick={handleCreateDiscussion}
          style={{
            padding: '10px 20px',
            borderRadius: '25px',
            background: '#1db954',
            color: 'black',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          + New Discussion
        </button>
      </div>

      {/* Sort Options */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['recent', 'popular', 'oldest'].map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: sortBy === option ? '2px solid #1db954' : '1px solid #444',
              background: sortBy === option ? '#1db95420' : 'transparent',
              color: sortBy === option ? '#1db954' : '#ccc',
              cursor: 'pointer',
              fontWeight: sortBy === option ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Discussions List */}
      {sortedDiscussions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#1a1a1a', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
          <h3>No discussions yet</h3>
          <p style={{ color: '#888', marginTop: '10px', marginBottom: '20px' }}>
            Be the first to start a conversation in this community!
          </p>
          <button
            onClick={handleCreateDiscussion}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              background: '#1db954',
              color: 'black',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start Discussion
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sortedDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              onClick={() => handleDiscussionClick(discussion.id)}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1db954';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{discussion.title}</h3>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#888' }}>
                  <span>⬆ {discussion.upvotes || 0}</span>
                  <span>💬 {discussion.commentCount || 0}</span>
                </div>
              </div>
              
              <p style={{ 
                color: '#aaa', 
                fontSize: '0.95rem', 
                marginBottom: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left'
              }}>
                {discussion.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#666' }}>
                <span style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>
                  {discussion.author?.charAt(0) || 'U'}
                </span>
                <span>{discussion.author || 'Unknown'}</span>
                <span>•</span>
                <span>{formatTimeAgo(discussion.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunityDetail;