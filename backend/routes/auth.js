const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/signup – Resident signup
router.post('/signup', async (req, res) => {
  const { username, password, fullName } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name, is_verified) 
       VALUES ($1, $2, 'resident', $3, FALSE) 
       RETURNING id, username, role, full_name`,
      [username, hash, fullName || null]
    );

    const user = result.rows[0];
    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'civifix_secret_2024_secure', { expiresIn: '24h' });

    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ msg: 'Username already taken' });
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/login – Universal login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, password_hash, role, full_name, is_verified FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) return res.status(401).json({ msg: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'civifix_secret_2024_secure', { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name, isVerified: user.is_verified } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/users - Get all assignable users (official/admin/authority)
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, role, full_name FROM users WHERE role IN ('admin', 'official', 'authority')`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
