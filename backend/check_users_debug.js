const pool = require('./db');

async function checkUsers() {
  try {
    const res = await pool.query('SELECT username, password_hash, role FROM users');
    console.log('--- USERS LIST ---');
    res.rows.forEach(user => {
      const hashPrefix = user.password_hash ? user.password_hash.substring(0, 7) : 'NONE';
      const hashLen = user.password_hash ? user.password_hash.length : 0;
      console.log(`Username: ${user.username}, HashPrefix: ${hashPrefix}, HashLen: ${hashLen}, Role: ${user.role}`);
    });
    console.log('------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }
}

checkUsers();
