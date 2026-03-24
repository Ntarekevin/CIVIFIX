const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Kevin@localhost:5432/civicfix_db'
});

async function seed() {
  try {
    const hashed = await bcrypt.hash('password123', 10);
    const query = `
      INSERT INTO users (username, password_hash, role, full_name, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
    `;
    const values = ['authority_kigali', hashed, 'authority', 'Kigali City Council', true];
    await pool.query(query, values);
    console.log('Authority "authority_kigali" created successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
