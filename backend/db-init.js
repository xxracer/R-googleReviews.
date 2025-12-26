
const { query } = require('./db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const migrateInstructorsData = async () => {
  try {
    const { rows } = await query('SELECT COUNT(*) FROM instructors');
    if (parseInt(rows[0].count, 10) > 0) {
      console.log('Instructors data already migrated. Skipping.');
      return;
    }

    const filePath = path.join(__dirname, 'instructors.json');
    if (!fs.existsSync(filePath)) {
      console.log('instructors.json not found. Skipping migration.');
      return;
    }
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const instructors = JSON.parse(jsonData);

    for (const instructor of instructors) {
      const { id, name, bio, image } = instructor;
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

const createUsersTable = async () => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        security_question TEXT,
        security_answer_hash TEXT
      );
    `;
    try {
      await query(createTableQuery);
      console.log('Table "users" created or already exists.');

      const { rows } = await query('SELECT COUNT(*) FROM users');
      if (parseInt(rows[0].count, 10) === 0) {
        const username = 'moon';
        const password = 'reingrules';
        const securityQuestion = 'bjj';
        const securityAnswer = 'bjj';

        const passwordHash = await bcrypt.hash(password, 10);
        const securityAnswerHash = await bcrypt.hash(securityAnswer, 10);

        await query(
          'INSERT INTO users (username, password_hash, security_question, security_answer_hash) VALUES ($1, $2, $3, $4)',
          [username, passwordHash, securityQuestion, securityAnswerHash]
        );
        console.log('Initial user "moon" migrated to database.');
      }
    } catch (err) {
      console.error('Error creating users table:', err);
    }
  };

const initializeDatabase = async () => {
  await createInstructorsTable();
  await createPageContentTable();
  await createUsersTable();
};

module.exports = { initializeDatabase };
