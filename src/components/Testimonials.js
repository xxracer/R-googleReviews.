import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Testimonials.css';

const placeholderReviews = [
  {
    id: 1,
    quote: "The best Jiu Jitsu school in Katy! The instructors are world-class and the community is incredibly supportive. My kids have learned so much more than just self-defense.",
    author: "— Maria S., Parent",
  },
  {
    id: 2,
    quote: "I was a complete beginner and felt welcomed from day one. The Fundamentals program is perfect for building a solid foundation. Highly recommend Reign BJJ.",
    author: "— John D., Student",
  },
  {
    id: 3,
    quote: "Top-tier training for competitors. The attention to detail and the level of the competition team is unmatched in the Houston area. This is where you come to get better.",
    author: "— Alex P., Competitor",
  },
  {
    id: 4,
    quote: "A fantastic place for the whole family. We all train here and it's been an amazing bonding experience. Clean facility and great people.",
    author: "— The Williams Family",
  },
];

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Note: The proxy in package.json directs this to the backend server
        // during development.
        const response = await axios.get('/api/google-reviews');
        if (response.data.success && response.data.reviews.length > 0) {
          setReviews(response.data.reviews);
        } else {
          // If the API returns no reviews or success is false, we'll use placeholders.
          setReviews(placeholderReviews);
        }
      } catch (err) {
        console.error("Error fetching Google reviews, using placeholders.", err);
        // If there's an error, fall back to placeholder reviews.
        setReviews(placeholderReviews);
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
    return (
      <section id="testimonials-section" className="testimonials-section">
        <h2 className="section-title">What Our Members Say</h2>
        <div className="testimonials-container">
          <p>Loading reviews...</p>
        </div>
      </section>
    );
  }

  // No explicit error display, just fall back to placeholders which is handled above

  return (
    <section id="testimonials-section" className="testimonials-section">
      <h2 className="section-title">What Our Members Say</h2>
      <div className="testimonials-container">
        <Slider {...settings}>
          {reviews.map((review, index) => (
            <div key={review.id || index}>
              <div className="testimonial-card">
                <p className="testimonial-quote">“{review.quote || review.text}”</p>
                <p className="testimonial-author">— {review.author || review.author_name}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;