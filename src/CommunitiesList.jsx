// CommunitiesList.jsx connected to database
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './discussions.css';
const API_URL = 'http://localhost:8000';
/////Communities list updated to us API /////////
function CommunitiesList() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [communities, setCommunities] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'official', 'joined'
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    // Fetch communities from database
    fetchCommunities();

    // Load joined communities from localStorage (for now - we can add to DB later)
    const savedJoined = localStorage.getItem(`joined_communities_${storedUser}`);
    if (savedJoined) {
      setJoinedCommunities(JSON.parse(savedJoined));
    }
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/scenes`);
      const data = await response.json();
      
      // Transform API data to match our component format
      const transformedCommunities = data.scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        description: scene.description,
        imageUrl: scene.imageUrl,
        isOfficial: scene.isOfficial,
        members: scene.members,
        discussions: 0, // We'll need to count threads separately if needed
        createdAt: scene.createdAt,
        createdBy: scene.createdBy
      }));
      
      setCommunities(transformedCommunities);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setIsLoading(false);
      // Fallback to empty array
      setCommunities([]);
    }
  };

  const handleCreateCommunity = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to create a community');
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  const handleCommunityClick = (communityId) => {
    navigate(`/community/${communityId}`);
  };

  const handleJoinCommunity = async (e, communityId) => {
    e.stopPropagation(); // Prevent navigation to community

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to join communities');
      navigate('/login');
      return;
    }

    const isJoined = joinedCommunities.includes(communityId);
    let updatedJoined;

    if (isJoined) {
      // Leave community
      updatedJoined = joinedCommunities.filter(id => id !== communityId);

      // Update local state (member count will be updated on next fetch)
      const updatedCommunities = communities.map(comm =>
        comm.id === communityId
          ? { ...comm, members: comm.members - 1 }
          : comm
      );
      setCommunities(updatedCommunities);
    } else {
      // Join community
      updatedJoined = [...joinedCommunities, communityId];

      // Update local state
      const updatedCommunities = communities.map(comm =>
        comm.id === communityId
          ? { ...comm, members: comm.members + 1 }
          : comm
      );
      setCommunities(updatedCommunities);
    }

    setJoinedCommunities(updatedJoined);
    localStorage.setItem(`joined_communities_${username}`, JSON.stringify(updatedJoined));

    // TODO: In the future, save join/leave to database
    // await fetch(`${API_URL}/api/scenes/${communityId}/join`, { method: 'POST', ... });
  };

  const getFilteredCommunities = () => {
    if (filter === 'official') {
      return communities.filter(c => c.isOfficial);
    } else if (filter === 'joined') {
      return communities.filter(c => joinedCommunities.includes(c.id));
    }
    return communities;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const filteredCommunities = getFilteredCommunities();

  if (isLoading) {
    return (
      <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
        <p>Loading communities...</p>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto', overflowX: 'hidden'}}>

      {/* Header */}
      <div className="communities-header" style={{ marginBottom: '30px' }}>
        <h1>Communities</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          Join communities to connect with fans and discuss your favorite music
        </p>
      </div>

      {/* Filter & Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === 'all' ? '2px solid #1db954' : '1px solid #444',
              background: filter === 'all' ? '#1db95420' : 'transparent',
              color: filter === 'all' ? '#1db954' : '#ccc',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? 'bold' : 'normal'
            }}
          >
            All Communities ({communities.length})
          </button>
          <button
            onClick={() => setFilter('official')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === 'official' ? '2px solid #1db954' : '1px solid #444',
              background: filter === 'official' ? '#1db95420' : 'transparent',
              color: filter === 'official' ? '#1db954' : '#ccc',
              cursor: 'pointer',
              fontWeight: filter === 'official' ? 'bold' : 'normal'
            }}
          >
            Official ({communities.filter(c => c.isOfficial).length})
          </button>
          <button
            onClick={() => setFilter('joined')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === 'joined' ? '2px solid #1db954' : '1px solid #444',
              background: filter === 'joined' ? '#1db95420' : 'transparent',
              color: filter === 'joined' ? '#1db954' : '#ccc',
              cursor: 'pointer',
              fontWeight: filter === 'joined' ? 'bold' : 'normal'
            }}
          >
            Joined ({joinedCommunities.length})
          </button>
        </div>

        <button
          onClick={handleCreateCommunity}
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
          + Create Community
        </button>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎵</div>
          <h2>No communities found</h2>
          <p style={{ marginTop: '10px' }}>
            {filter === 'joined'
              ? 'You haven\'t joined any communities yet. Explore and join some!'
              : 'No communities available at the moment.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '100%'
        }}>
          {filteredCommunities.map((community) => {
            const isJoined = joinedCommunities.includes(community.id);

            return (
              <div
                key={community.id}
                onClick={() => handleCommunityClick(community.id)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1db954';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Official Badge */}
                {community.isOfficial && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#1db954',
                    color: 'black',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    OFFICIAL
                  </div>
                )}

                {/* Community Image */}
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: community.imageUrl
                    ? `url(${community.imageUrl}) center/cover`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}></div>

                {/* Community Info */}
                <h3 style={{
                  fontSize: '1.2rem',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {community.name}
                </h3>

                <p style={{
                  color: '#aaa',
                  fontSize: '0.9rem',
                  marginBottom: '15px',
                  height: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {community.description}
                </p>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '0.85rem',
                  color: '#888',
                  marginBottom: '15px'
                }}>
                  <span>👥 {community.members?.toLocaleString() || 0} members</span>
                  <span>💬 {community.discussions || 0} discussions</span>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid #333'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    Created {formatDate(community.createdAt)}
                  </span>

                  <button
                    onClick={(e) => handleJoinCommunity(e, community.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: isJoined ? '1px solid #1db954' : '1px solid #444',
                      background: isJoined ? 'transparent' : '#1db954',
                      color: isJoined ? '#1db954' : 'black',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    {isJoined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CommunitiesList;
