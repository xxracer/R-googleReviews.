
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import ImageLibrary from './ImageLibrary';
import './ImageEditor.css';

const ImageEditor = ({ sectionId, title, showPositionControl = false }) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [objectPosition, setObjectPosition] = useState('center');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const apiBaseUrl = '';

  // Fetch current image on mount
  useEffect(() => {
    const fetchCurrentImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`);
        if (response.data && response.data.content_value) {
          const content = JSON.parse(response.data.content_value);
          setCurrentImageUrl(content.url);
          setObjectPosition(content.position || 'center');
          setPosition(content.coords || { x: 0, y: 0 });
          setScale(content.scale || 1);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error(`Error fetching content for ${sectionId}:`, error);
          setStatusMessage('Could not load current image.');
          setMessageType('error');
        }
      }
    };
    fetchCurrentImage();
  }, [sectionId, apiBaseUrl]);

  // Cleanup blob URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl); // This will trigger the cleanup for the old URL
    setStatusMessage('Image preview updated. Click "Save Changes" to apply.');
    setMessageType('info');
  };

  const handlePositionChange = (event) => {
    setObjectPosition(event.target.value);
  };

  const handleScaleChange = (event) => {
    setScale(parseFloat(event.target.value));
  };

  const handleDrag = (e, ui) => {
    setPosition({ x: position.x + ui.deltaX, y: position.y + ui.deltaY });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage('Saving...');
    setMessageType('');

    let imageUrl = currentImageUrl;

    try {
      if (selectedFile) {
        setStatusMessage('Uploading image...');
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await axios.post(`${apiBaseUrl}/api/upload`, formData);
        imageUrl = uploadResponse.data.url;
      }

      // If after all that, there's still no image, then we can't save.
      if (!imageUrl && !previewUrl) {
        setStatusMessage('Please select an image to save.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      // Use the preview URL if there is one and it hasn't been uploaded yet
      const finalImageUrl = selectedFile ? imageUrl : currentImageUrl;

      setStatusMessage('Saving content...');
      const contentToSave = {
        url: finalImageUrl,
        position: objectPosition,
        coords: position,
        scale: scale,
      };

      await axios.put(`${apiBaseUrl}/api/content/${sectionId}`, {
        content_type: 'image_details',
        content_value: JSON.stringify(contentToSave),
      });

      setCurrentImageUrl(finalImageUrl);
      setStatusMessage('Image updated successfully!');
      setMessageType('success');
      setSelectedFile(null);
      setPreviewUrl(null); // Clear preview after successful save
    } catch (error) {
      console.error('Failed to update image:', error);
      setStatusMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromLibrary = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setSelectedFile(null);
    setPreviewUrl(null); // Clear local file preview
    setStatusMessage('Image selected from library. Click "Save Changes" to apply.');
    setMessageType('info');
    setIsLibraryOpen(false);
  };

  const nodeRef = useRef(null);
  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="image-editor">
      {isLibraryOpen && (
        <ImageLibrary
          onSelect={handleSelectFromLibrary}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}
      <h3>{title}</h3>
      <div className="image-preview draggable-container">
        <p>Preview (Drag to reposition):</p>
        {displayUrl ? (
          <Draggable nodeRef={nodeRef} onDrag={handleDrag} defaultPosition={position}>
            <div ref={nodeRef} style={{ cursor: 'move', display: 'inline-block' }}>
              <img
                src={displayUrl}
                alt="Preview"
                style={{
                  objectPosition: objectPosition,
                  transform: `scale(${scale})`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </div>
          </Draggable>
        ) : (
          <div className="no-image-placeholder">No Image Selected</div>
        )}
      </div>
      <div className="upload-controls">
        <input type="file" onChange={handleFileChange} accept="image/*,image/gif" />
        <button className="btn" onClick={() => setIsLibraryOpen(true)}>Choose from Library</button>
        {showPositionControl && (
          <select value={objectPosition} onChange={handlePositionChange}>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        )}
      </div>
      <div className="zoom-control">
          <label htmlFor={`zoom-${sectionId}`}>Zoom:</label>
          <input
            type="range"
            id={`zoom-${sectionId}`}
            min="0.5"
            max="3"
            step="0.05"
            value={scale}
            onChange={handleScaleChange}
          />
        </div>
      <div className="save-container">
        <button className="btn" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {statusMessage && <p className={`status-message ${messageType}`}>{statusMessage}</p>}
    </div>
  );
};

export default ImageEditor;
