const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- Database Initialization ---
const { initializeDatabase } = require('./db-init');
const db = require('./db');
const multer = require('multer');
const { put } = require('@vercel/blob');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

(async () => {
  await initializeDatabase();
})();
// ----------------------------

// --- Vercel Deployment Fix ---
const IS_VERCEL = process.env.VERCEL === '1';
const LOCAL_DB_PATH = path.join(__dirname, 'instructors.json');
const VERCEL_TMP_DB_PATH = '/tmp/instructors.json';
const DB_PATH = IS_VERCEL ? VERCEL_TMP_DB_PATH : LOCAL_DB_PATH;
// ----------------------------

app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---

// Instructors API
app.get('/api/instructors', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM instructors ORDER BY id ASC');
    // The `bio` field is an array of strings (TEXT[] in Postgres).
    // The `id` from the file is now `original_id`.
    // We will keep the new `id` from the database as the main identifier.
    res.json(rows);
  } catch (err) {
    console.error('Error fetching instructors from DB:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
});

app.post('/api/instructors', async (req, res) => {
  const { name, bio, image } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO instructors (name, bio, image) VALUES ($1, $2, $3) RETURNING *',
      [name, bio, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating instructor in DB:', err);
    res.status(500).json({ success: false, message: 'Failed to create instructor.' });
  }
});

app.put('/api/instructors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, bio, image } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE instructors SET name = $1, bio = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, bio, image, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating instructor in DB:', err);
    res.status(500).json({ success: false, message: 'Failed to update instructor.' });
  }
});

app.delete('/api/instructors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM instructors WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting instructor from DB:', err);
    res.status(500).json({ success: false, message: 'Failed to delete instructor.' });
  }
});

// Generic Image Upload API
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }

  try {
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true, // Allow overwriting the file
    });

    res.status(200).json({ success: true, url: blob.url });
  } catch (err) {
    console.error('Error uploading image to Vercel Blob:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
});

// --- Page Content API ---
app.get('/api/content/:section_id', async (req, res) => {
  const { section_id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM page_content WHERE section_id = $1', [section_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching content from DB:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

app.put('/api/content/:section_id', async (req, res) => {
  const { section_id } = req.params;
  const { content_type, content_value } = req.body;

  if (!content_type || content_value === undefined) {
    return res.status(400).json({ success: false, message: 'content_type and content_value are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO page_content (section_id, content_type, content_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (section_id)
       DO UPDATE SET content_type = $2, content_value = $3
       RETURNING *`,
      [section_id, content_type, content_value]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error upserting content in DB:', err);
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});


// Webhook Contact Form API

// For local development, we still need to listen on a port.
if (!IS_VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running for local development on http://localhost:${PORT}`);
  });
}

// Google Reviews API
app.get('/api/google-reviews', async (req, res) => {
  const { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } = process.env;

  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    console.log('Google Places API credentials not found.');
    return res.status(500).json({ success: false, message: 'API credentials not configured.' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await axios.get(url);
    const place = response.data.result;

    if (place && place.reviews) {
      const fiveStarReviews = place.reviews.filter(review => review.rating === 5);
      res.json({ success: true, reviews: fiveStarReviews });
    } else {
      res.json({ success: true, reviews: [] });
    }
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Export the app for Vercel's serverless environment
module.exports = app;