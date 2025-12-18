import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageEditor.css';

const ImageEditor = ({ sectionId, title }) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  // Fetch the current image for this section
  useEffect(() => {
    const fetchCurrentImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`);
        if (response.data && response.data.content_value) {
          setCurrentImageUrl(response.data.content_value);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`No content found for section '${sectionId}'. A new entry will be created upon save.`);
        } else {
          console.error(`Error fetching content for ${sectionId}:`, error);
          setStatusMessage('Could not load current image.');
          setMessageType('error');
        }
      }
    };
    fetchCurrentImage();
  }, [sectionId, apiBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setStatusMessage(''); // Clear previous messages
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select an image file first.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Uploading image...');
    setMessageType('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Step 1: Upload the image
      const uploadResponse = await axios.post(`${apiBaseUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImageUrl = uploadResponse.data.url;
      if (!newImageUrl) {
        throw new Error('Image URL not returned from upload.');
      }

      setStatusMessage('Image uploaded. Saving content...');

      // Step 2: Save the new image URL to the page_content table
      await axios.put(`${apiBaseUrl}/api/content/${sectionId}`, {
        content_type: 'image_url',
        content_value: newImageUrl,
      });

      setCurrentImageUrl(newImageUrl);
      setStatusMessage('Image updated successfully!');
      setMessageType('success');
      setSelectedFile(null); // Clear the file input
    } catch (error) {
      console.error('Failed to update image:', error);
      setStatusMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="image-editor">
      <h3>{title}</h3>
      {currentImageUrl && (
        <div className="image-preview">
          <p>Current Image:</p>
          <img src={currentImageUrl} alt={title} />
        </div>
      )}
      <div className="upload-controls">
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button className="btn" onClick={handleSave} disabled={isLoading || !selectedFile}>
          {isLoading ? 'Saving...' : 'Save New Image'}
        </button>
      </div>
      {statusMessage && (
        <p className={`status-message ${messageType}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default ImageEditor;
