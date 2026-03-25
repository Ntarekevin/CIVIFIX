const pool = require('./db');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE username = 'admin'",
      [passwordHash]
    );
    console.log("Password for 'admin' has been reset to 'password123'");
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin:', err);
    process.exit(1);
  }
}

resetAdmin();
