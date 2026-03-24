const { Client } = require('pg');
require('dotenv').config();

async function check() {
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

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:');
    tablesRes.rows.forEach(row => console.log(`- ${row.table_name}`));

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reports'
    `);
    console.log('Columns in reports table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

    const locRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'locations'
    `);
    console.log('\nColumns in locations table:');
    locRes.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

check();
