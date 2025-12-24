const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createActivityLogsTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
      );
    `;

    await client.query(createTableQuery);
    console.log('✓ activity_logs table created successfully');

    await client.end();
  } catch (error) {
    console.error('Error:', error);
    await client.end();
  }
}

createActivityLogsTable();
