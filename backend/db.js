const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log("Successfully connected to the database.");
        client.release();
    } catch (err) {
        console.error("Failed to connect to the database:", err);
        throw err;
    }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
