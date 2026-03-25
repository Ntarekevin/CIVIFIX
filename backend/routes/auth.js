const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// @route   POST api/auth/register
// @desc    Register a new authority/admin (for setup)
router.post('/register', async (req, res) => {
  const { username, password, role, fullName } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash, role, full_name, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role',
      [username, passwordHash, role || 'official', fullName || '', true]
    );

    const payload = { id: newUser.rows[0].id, username: newUser.rows[0].username, role: newUser.rows[0].role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`Login attempt for username: [${username}]`);
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userRes.rows.length === 0) {
      console.log(`User not found: [${username}]`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    console.log(`User found: ${user.username}, Role: ${user.role}`);
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
