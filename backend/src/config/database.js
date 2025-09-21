const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'manufacturing_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'admin'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await pool.end();
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

// Database query helper functions
const db = {
  // Execute a query with parameters
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Get a single client from the pool
  getClient: async () => {
    return await pool.connect();
  },

  // Begin a transaction
  beginTransaction: async () => {
    const client = await pool.connect();
    await client.query('BEGIN');
    return client;
  },

  // Commit a transaction
  commitTransaction: async (client) => {
    await client.query('COMMIT');
    client.release();
  },

  // Rollback a transaction
  rollbackTransaction: async (client) => {
    await client.query('ROLLBACK');
    client.release();
  },

  // Close the pool
  close: async () => {
    await pool.end();
  }
};

module.exports = db;
