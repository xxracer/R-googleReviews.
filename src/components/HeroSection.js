import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeroSection.css';

const HeroSection = ({ videoOpacity }) => {
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState('/videos/reign.mp4'); // Default video
  const [isLoading, setIsLoading] = useState(true);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const imageResponse = await axios.get(`${apiBaseUrl}/api/content/homepage_main_image`);
        if (imageResponse.data && imageResponse.data.content_value) {
          setHeroImageUrl(imageResponse.data.content_value);
        }

        const videoResponse = await axios.get(`${apiBaseUrl}/api/content/homepage_hero_video`);
        if (videoResponse.data && videoResponse.data.content_value) {
          setHeroVideoUrl(videoResponse.data.content_value);
        }
      } catch (error) {
        console.error('Error fetching homepage hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroContent();
  }, [apiBaseUrl]);

  return (
    <section className="hero-section">
      {isLoading ? (
        <div className="hero-video-wrapper"></div> // Placeholder for smooth loading
      ) : heroImageUrl ? (
        <div className="hero-image-wrapper">
          <img src={heroImageUrl} alt="Jiu Jitsu Academy" className="hero-image-bg" />
        </div>
      ) : (
        <div className="hero-video-wrapper" style={{ opacity: videoOpacity }}>
          <video autoPlay loop muted playsInline className="hero-video-bg">
            <source src={heroVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      <div className="hero-content">
        <h1 className="hero-main-title">Katys Premier Jiu Jitsu Academy</h1>
        <p className="hero-sub-text">Kids Jiu-Jitsu • Adult Gi & No-Gi • Competition & Homeschool Training</p>
        <a href="#contact" className="hero-cta-button">Book Your Trial Class</a>
      </div>
    </section>
  );
};

export default HeroSection;
