import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

function NotificationBell({ username, isAuthenticated }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState({
    follows: [],
    replies: [],
    scene_activity: [],
    other: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!username || !isAuthenticated) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notifications/count?username=${username}`);
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!username || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/notifications?username=${username}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications? This will remove them from your view.')) return;
    
    try {
      // Mark all as read first
      await fetch(`${API_URL}/api/notifications/mark-all-read?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Clear from local state immediately
      setNotifications({
        follows: [],
        replies: [],
        scene_activity: [],
        other: []
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setUnreadCount(0);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notifId) => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-read?notif_id=${notifId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Follow back
  const handleFollowBack = async (e, followerUsername, notifId) => {
    e.stopPropagation(); // Prevent notification click
    
    try {
      const response = await fetch(`${API_URL}/api/users/${followerUsername}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_username: username })
      });
      
      const data = await response.json();
      
      // Show success message
      if (data.isFollowing) {
        alert(`🎉 You and ${followerUsername} are now friends!`);
      }
      
      // Mark notification as read
      await markAsRead(notifId);
      
    } catch (error) {
      console.error('Error following back:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notif) => {
    // Debug: Log notification data
    console.log('Notification clicked:', notif);
    console.log('Type:', notif.type);
    console.log('ThreadId:', notif.threadId);
    console.log('SceneId:', notif.sceneId);
    
    // Mark as read immediately
    await markAsRead(notif.id);
    
    // Navigate based on notification type
    if (notif.type === 'follow' && notif.actor) {
      navigate(`/profile/${notif.actor.username}`);
    } else if ((notif.type === 'reply' || notif.type === 'mention') && notif.threadId && notif.sceneId) {
      // Navigate to the thread with reply hash for scroll + highlight
      const replyHash = notif.replyId ? `#reply-${notif.replyId}` : '';
      console.log('Navigating to:', `/scene/${notif.sceneId}/thread/${notif.threadId}${replyHash}`);
      navigate(`/scene/${notif.sceneId}/thread/${notif.threadId}${replyHash}`);
    } else if (notif.type === 'thread' && notif.sceneId) {
      navigate(`/scene/${notif.sceneId}`);
    }
    
    setIsOpen(false);
    setIsExpanded(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isAuthenticated) {
      setIsOpen(!isOpen);
      return;
    }
    
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!username || !isAuthenticated) return;
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [username, isAuthenticated]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const allNotifications = [
    ...notifications.follows,
    ...notifications.replies,
    ...notifications.scene_activity,
    ...notifications.other
  ].filter(n => !n.isRead) // Only show unread notifications
   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayedNotifications = isExpanded ? allNotifications : allNotifications.slice(0, 5);
  const hasMore = allNotifications.length > 5;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        style={{
          position: 'relative',
          background: '#222',
          border: '1px solid #333',
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          width: '40px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#333';
          e.currentTarget.style.borderColor = '#444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#222';
          e.currentTarget.style.borderColor = '#333';
        }}
      >
        <Bell size={20} color="white" />
        
        {/* Badge */}
        {isAuthenticated && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            minWidth: '18px',
            textAlign: 'center',
            border: '2px solid #121212'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '380px',
          maxHeight: isExpanded ? '600px' : '500px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'max-height 0.3s ease'
        }}>
          
          {/* Not Logged In State */}
          {!isAuthenticated && (
            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
              <Bell size={48} color="#666" style={{ marginBottom: '15px' }} />
              <h3 style={{ marginBottom: '10px', color: 'white' }}>Stay Updated</h3>
              <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>
                Sign in to see your notifications
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  style={{
                    background: '#770505',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setIsOpen(false);
                  }}
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid #333',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Logged In State */}
          {isAuthenticated && (
            <>
              {/* Header */}
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Notifications</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '4px 8px'
                    }}
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {isLoading ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                    Loading...
                  </div>
                ) : allNotifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                    <Bell size={40} color="#444" style={{ marginBottom: '10px' }} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <>
                    {displayedNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '15px 20px',
                          cursor: 'pointer',
                          background: notif.isRead ? 'transparent' : 'rgba(29, 185, 84, 0.1)',
                          borderLeft: notif.isRead ? 'none' : '3px solid #1db954',
                          borderBottom: '1px solid #222',
                          transition: 'background 0.2s',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          opacity: notif.isRead ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                        onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(29, 185, 84, 0.1)'}
                      >
                        {/* Avatar */}
                        {notif.actor && (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#555',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            {notif.actor.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '0.9rem',
                            color: 'white',
                            lineHeight: '1.4',
                            fontWeight: notif.isRead ? 'normal' : 'bold'
                          }}>
                            {notif.message}
                          </p>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.75rem',
                            color: '#888'
                          }}>
                            {formatTimeAgo(notif.createdAt)}
                          </p>

                          {/* Follow Back Button */}
                          {notif.type === 'follow' && notif.actor && !notif.isRead && (
                            <button
                              onClick={(e) => handleFollowBack(e, notif.actor.username, notif.id)}
                              style={{
                                background: '#1db954',
                                color: 'black',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#1ed760'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#1db954'}
                            >
                              Follow Back
                            </button>
                          )}
                        </div>

                        {/* Unread indicator */}
                        {!notif.isRead && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#1db954',
                            flexShrink: 0,
                            marginTop: '6px'
                          }} />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer - Expand/Collapse */}
              {hasMore && allNotifications.length > 0 && (
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #333',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1db954',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {isExpanded ? 'Show Less' : `View All (${allNotifications.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;