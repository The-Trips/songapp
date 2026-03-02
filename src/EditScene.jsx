import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, UserMinus, AlertTriangle, Check, ArrowLeft } from 'lucide-react';
import './threads.css';

const API_URL = "http://localhost:8000";

function EditScene() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [username, setUsername] = useState('User');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [savingField, setSavingField] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_username');
    if (storedUser) setUsername(storedUser);

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      alert('Please log in to edit a scene');
      navigate('/login');
      return;
    }

    fetchSceneData();
  }, [id, navigate]);

  const fetchSceneData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scenes/${id}`);
      if (!res.ok) {
        alert("Scene not found");
        navigate('/scenes');
        return;
      }
      const data = await res.json();
      
      const storedUser = localStorage.getItem('app_username');
      if (data.owner !== storedUser) {
        alert("Only the creator can edit this scene");
        navigate(`/scene/${id}`);
        return;
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        imageUrl: data.imageUrl || ''
      });
    } catch (err) {
      console.error("Error fetching scene:", err);
      alert("Error loading scene data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Too short (min 10)';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Too long (max 500)';
    }

    if (formData.imageUrl.trim() && !isValidUrl(formData.imageUrl.trim())) {
      newErrors.imageUrl = 'Invalid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSaveField = async (fieldName) => {
    if (!validateForm()) return;

    setSavingField(fieldName);

    const payload = {
      description: formData.description.trim(),
      image_url: formData.imageUrl.trim() || null,
      username: username
    };

    try {
      const res = await fetch(`${API_URL}/api/scenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSavingField(`${fieldName}-success`);
        setTimeout(() => setSavingField(null), 2000);
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to update scene");
        setSavingField(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
      setSavingField(null);
    }
  };

  const handleCancel = () => {
    navigate(`/scene/${id}`);
  };

  if (isLoading) {
    return <div className="main-content" style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  const RenderSaveButton = ({ fieldName, disabled = false }) => {
    const isSaving = savingField === fieldName;
    const isSuccess = savingField === `${fieldName}-success`;

    return (
      <button
        type="button"
        onClick={() => handleSaveField(fieldName)}
        disabled={disabled || isSaving || isSuccess}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: isSuccess ? '#1db954' : (disabled || isSaving ? '#222' : '#1db954'),
          color: isSuccess ? 'white' : 'black',
          fontWeight: 'bold',
          cursor: (disabled || isSaving || isSuccess) ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          minWidth: '65px',
          justifyContent: 'center',
          transition: 'all 0.2s',
          height: '34px'
        }}
      >
        {isSaving ? '...' : isSuccess ? <Check size={14} /> : 'Save'}
      </button>
    );
  };

  return (
    <div className="main-content" style={{
      padding: '30px',
      color: 'white',
      maxWidth: '650px',
      margin: '0 auto'
    }}>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '15px'
      }}>
        <div className="flex flex-col items-start">
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Scene Settings</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
            Editing: <span style={{ color: '#1db954', fontWeight: 'bold' }}>{formData.name}</span>
          </p>
        </div>
        <button
          onClick={handleCancel}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#ccc',
            padding: '6px 14px',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Description Section */}
        <div style={{ 
          background: '#121212', 
          padding: '15px', 
          borderRadius: '10px',
          border: '1px solid #222'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.85rem', color: '#888' }}>
            DESCRIPTION
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: errors.description ? '1px solid #e74c3c' : '1px solid #333',
                  background: '#0a0a0a',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem' }}>
                <span style={{ color: errors.description ? '#e74c3c' : '#555' }}>
                  {errors.description || `${formData.description.length}/500`}
                </span>
              </div>
            </div>
            <RenderSaveButton fieldName="description" disabled={!formData.description.trim()} />
          </div>
        </div>

        {/* Image URL Section */}
        <div style={{ 
          background: '#121212', 
          padding: '15px', 
          borderRadius: '10px',
          border: '1px solid #222'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.85rem', color: '#888' }}>
            COVER IMAGE URL
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="bg-black border border-zinc-800 focus:border-green-500 rounded px-3 text-sm h-[34px] flex-1 outline-none text-white"
            />
            <RenderSaveButton fieldName="imageUrl" />
          </div>
          {errors.imageUrl && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px' }}>{errors.imageUrl}</p>}
          
          {formData.imageUrl && !errors.imageUrl && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `url(${formData.imageUrl}) center/cover`,
                borderRadius: '4px',
                border: '1px solid #333'
              }}></div>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>Preview loaded</span>
            </div>
          )}
        </div>

        {/* Advanced Section */}
        <div style={{
          marginTop: '10px',
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(231, 76, 60, 0.05)',
          border: '1px dashed rgba(231, 76, 60, 0.2)'
        }}>
          <h3 style={{ 
            color: '#e74c3c', 
            fontSize: '0.9rem', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <AlertTriangle size={14} /> Advanced
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={14} color="#555" />
                <span style={{ fontSize: '0.85rem', color: '#ccc' }}>Visibility</span>
              </div>
              <select 
                defaultValue="public"
                className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-400 outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserMinus size={14} color="#555" />
                  <span style={{ fontSize: '0.85rem', color: '#ccc' }}>Ownership</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#666' }}>Resigning is permanent</span>
              </div>
              <button
                type="button"
                onClick={() => alert("MOCK: Ownership resign.")}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #e74c3c',
                  background: 'transparent',
                  color: '#e74c3c',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Resign
              </button>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 40px',
              borderRadius: '25px',
              border: 'none',
              background: '#1db954',
              color: 'black',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditScene;
