import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Testimonials.css';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/google-reviews');
        if (response.data.success && response.data.reviews.length > 0) {
          setReviews(response.data.reviews);
        } else {
          setError('No reviews found.');
        }
      } catch (err) {
        setError('Failed to fetch reviews.');
        console.error('Error fetching Google Reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
  };

  if (loading) {
    return <section id="testimonials-section" className="testimonials-section"><p>Loading reviews...</p></section>;
  }

  if (error) {
    return <section id="testimonials-section" className="testimonials-section"><p>{error}</p></section>;
  }

  return (
    <section id="testimonials-section" className="testimonials-section">
      <h2 className="section-title">What Our Members Say</h2>
      <div className="testimonials-container">
        <Slider {...settings}>
          {reviews.map((review, index) => (
            <div key={index}>
              <div className="testimonial-card">
                <p className="testimonial-quote">“{review.text}”</p>
                <p className="testimonial-author">— {review.author_name}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
