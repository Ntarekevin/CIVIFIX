const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to', process.env.DB_NAME);

    console.log('Attempting to create a test table...');
    await client.query('CREATE TABLE test_table (id SERIAL PRIMARY KEY, val TEXT)');
    console.log('Test table created successfully');

    await client.query('DROP TABLE test_table');
    console.log('Test table dropped');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
