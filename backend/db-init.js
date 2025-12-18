
const { query } = require('./db');

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
