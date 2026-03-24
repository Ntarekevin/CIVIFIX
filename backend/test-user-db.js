const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('SUCCESS: Connected as', process.env.DB_USER);
    const res = await client.query('SELECT current_user, current_database()');
    console.log('Session info:', res.rows[0]);
    
    // Test write permission on reports
    console.log('Testing write permission...');
    const insertRes = await client.query(`
      INSERT INTO reports (category, tracking_token, public_id, status)
      VALUES ('test', 'test-token-' || random(), 'test-public-id', 'open')
      RETURNING id
    `);
    console.log('SUCCESS: Inserted test report with ID', insertRes.rows[0].id);
    
    // Cleanup
    await client.query('DELETE FROM reports WHERE id = $1', [insertRes.rows[0].id]);
    console.log('SUCCESS: Cleaned up test report.');

  } catch (err) {
    console.error('FAILURE:', err.message);
    if (err.code === '28P01') console.error('HINT: Password authentication failed.');
    if (err.code === '42501') console.error('HINT: Permission denied. Maybe GRANT ALL was not enough?');
  } finally {
    await client.end();
  }
}

testConnection();
