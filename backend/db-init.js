
const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const migrateInstructorsData = async () => {
  try {
    // Check if the table is empty before migrating
    const { rows } = await query('SELECT COUNT(*) FROM instructors');
    if (parseInt(rows[0].count, 10) > 0) {
      console.log('Instructors data already migrated. Skipping.');
      return;
    }

    // Read the local JSON file only if it exists
    const filePath = path.join(__dirname, 'instructors.json');
    if (!fs.existsSync(filePath)) {
      console.log('instructors.json not found. Skipping migration.');
      return;
    }
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const instructors = JSON.parse(jsonData);

    // Insert each instructor into the database
    for (const instructor of instructors) {
      const { id, name, bio, image } = instructor;
      // Convert the array of bio strings into a single HTML string
      const bioHtml = bio.map(paragraph => `<p>${paragraph}</p>`).join('');
      await query(
        'INSERT INTO instructors (name, bio, image, original_id) VALUES ($1, $2, $3, $4)',
        [name, bioHtml, image, id]
      );
    }
    console.log('Successfully migrated instructors data from JSON to database.');
  } catch (err) {
    console.error('Error migrating instructors data:', err);
  }
};

const createInstructorsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS instructors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      bio TEXT NOT NULL,
      image VARCHAR(255),
      original_id VARCHAR(50)
    );
  `;
  try {
    await query(createTableQuery);
    console.log('Table "instructors" created or already exists.');
    // After ensuring the table exists, run the migration
    await migrateInstructorsData();
  } catch (err) {
    console.error('Error creating instructors table:', err);
  }
};

const createPageContentTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS page_content (
      id SERIAL PRIMARY KEY,
      section_id VARCHAR(255) UNIQUE NOT NULL,
      content_type VARCHAR(50) NOT NULL,
      content_value TEXT
    );
  `;
  try {
    await query(createTableQuery);
    console.log('Table "page_content" created or already exists.');
  } catch (err) {
    console.error('Error creating page_content table:', err);
  }
};

// We'll rename the main export to a more generic name
const initializeDatabase = async () => {
  await createInstructorsTable();
  await createPageContentTable();
};

module.exports = { initializeDatabase };
