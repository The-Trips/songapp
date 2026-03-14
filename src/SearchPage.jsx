import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ artists: [], albums: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults({ artists: [], albums: [], users: [] });
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // TODO: Add user search when backend endpoint is ready
      // For now, users array will be empty
      setResults(data);
      setHasSearched(true);
      setIsLoading(false);
      setSearchParams({ q: query });
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  const totalResults = results.artists.length + results.albums.length + results.users.length;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      
      {/* Search Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Search</h1>
        <p style={{ color: '#888', fontSize: '1rem' }}>Search for artists, albums, and users</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '40px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for artists, albums, or users..."
          autoFocus
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: '1.1rem',
            borderRadius: '30px',
            border: '2px solid #333',
            background: '#1a1a1a',
            color: 'white',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#646cff'}
          onBlur={(e) => e.target.style.borderColor = '#333'}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>Searching...</p>
        </div>
      )}

      {/* No Results */}
      {!isLoading && hasSearched && totalResults === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>No results found for "{searchQuery}"</p>
          <p style={{ fontSize: '0.95rem' }}>Try searching for different artists, albums, or users</p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && hasSearched && totalResults > 0 && (
        <div style={{ marginBottom: '30px', color: '#888' }}>
          <p>{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
        </div>
      )}

      {/* Artists Results */}
      {results.artists.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            Artists ({results.artists.length})
          </h2>
          
          {results.artists.map((artist) => (
            <div
              key={artist.id}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '25px',
                marginBottom: '25px'
              }}
            >
              {/* Artist Header - Clickable to artist page */}
              <div
                onClick={() => navigate(`/artist/${artist.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '25px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Artist Avatar */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {artist.name.charAt(0)}
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                    {artist.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>
                    {artist.albums.length} album{artist.albums.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Artist's Albums */}
              {artist.albums.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#888', marginBottom: '15px', paddingLeft: '10px' }}>Albums</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    {artist.albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => navigate(`/album/${album.id}`)}
                        style={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <img
                          src={album.coverUrl || '/placeholder-album.png'}
                          alt={album.name}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <p style={{
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: '#fff',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {album.name}
                        </p>
                        {album.releaseDate && (
                          <p style={{ fontSize: '0.8rem', color: '#888' }}>
                            {new Date(album.releaseDate).getFullYear()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Artist's Scenes */}
              {artist.scenes && artist.scenes.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' }}>
                  <h4 style={{ fontSize: '1rem', color: '#888', marginBottom: '15px', paddingLeft: '10px' }}>Communities</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {artist.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        onClick={() => navigate(`/scene/${scene.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          padding: '12px',
                          background: '#0a0a0a',
                          border: '1px solid #444',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}
                      >
                        {scene.imageUrl && (
                          <img
                            src={scene.imageUrl}
                            alt={scene.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#fff' }}>{scene.name}</p>
                          {scene.isOfficial && (
                            <p style={{ fontSize: '0.8rem', color: '#1db954' }}>✓ Official</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Albums Results */}
      {results.albums.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            Albums ({results.albums.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {results.albums.map((album) => (
              <div
                key={album.id}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.borderColor = '#646cff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#333';
                }}
                onClick={() => navigate(`/album/${album.id}`)}
              >
                <img
                  src={album.coverUrl || '/placeholder-album.png'}
                  alt={album.name}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {album.name}
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#888',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {album.artist}
                </p>
                {album.releaseDate && (
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(album.releaseDate).getFullYear()}
                  </p>
                )}

                {/* Related Scenes */}
                {album.scenes && album.scenes.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Related Communities:</p>
                    {album.scenes.slice(0, 2).map((scene) => (
                      <div
                        key={scene.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/scene/${scene.id}`);
                        }}
                        style={{
                          fontSize: '0.85rem',
                          color: '#1db954',
                          marginBottom: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        → {scene.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Results */}
      {results.users && results.users.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            Users ({results.users.length})
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/profile/${user.username}`)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#222';
                  e.currentTarget.style.borderColor = '#646cff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                {/* User Avatar */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
                    {user.username}
                  </p>
                  {user.bio && (
                    <p style={{ fontSize: '0.9rem', color: '#888' }}>
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !isLoading && searchQuery.length < 2 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Start typing to search</p>
          <p style={{ fontSize: '0.95rem' }}>Search for your favorite artists, albums, and users</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
