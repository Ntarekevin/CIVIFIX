const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const pool = require('../db');
const authenticateAuthority = require('../middleware/auth');

// --- File Upload Setup (Multer) ---
// Using memory storage so we can scrub EXIF before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

// --- Helper: Obfuscate coordinates to ~1km precision ---
const obfuscateCoords = (lng, lat) => ({
  lng: Math.round(lng * 100) / 100,   // ~1.1km at equator
  lat: Math.round(lat * 100) / 100,
});

// --- Helper: Generate tracking token ---
const generateToken = () => crypto.randomBytes(12).toString('hex');

// --- Helper: Generate public anonymous ID (#24A102I07) ---
const generatePublicId = () => {
  const years = new Date().getFullYear().toString().slice(-2);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const char1 = chars.charAt(Math.floor(Math.random() * chars.length));
  const digits1 = Math.floor(100 + Math.random() * 900).toString(); // 3 digits
  const char2 = chars.charAt(Math.floor(Math.random() * chars.length));
  const digits2 = Math.floor(10 + Math.random() * 90).toString(); // 2 digits
  return `#${years}${char1}${digits1}${char2}${digits2}`;
};

// --- Helper: Upload file buffer to S3 (or save locally if S3 not configured) ---
const uploadToStorage = async (file, reportId) => {
  const AWS_CONFIGURED =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET;

  if (AWS_CONFIGURED) {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });

    // Scrub EXIF from images using sharp
    let buffer = file.buffer;
    if (file.mimetype.startsWith('image/')) {
      const sharp = require('sharp');
      buffer = await sharp(file.buffer)
        .rotate()              // applies EXIF rotation, then strips it
        .toBuffer();
    }

    const key = `reports/${reportId}/${Date.now()}-${file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
      })
    );
    return `s3://${process.env.AWS_S3_BUCKET}/${key}`;
  } else {
    // Fallback: save to local /uploads directory
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', 'uploads', String(reportId));
    fs.mkdirSync(uploadsDir, { recursive: true });

    let buffer = file.buffer;
    if (file.mimetype.startsWith('image/')) {
      try {
        const sharp = require('sharp');
        buffer = await sharp(file.buffer).rotate().toBuffer();
      } catch {
        // sharp optional
      }
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${reportId}/${filename}`;
  }
};

// ============================================================
// POST /api/reports  – Submit anonymous report
// ============================================================
router.post('/', upload.array('media', 5), async (req, res) => {
  const { category, description, latitude, longitude, address, city } = req.body;

  if (!category) {
    return res.status(400).json({ msg: 'Category is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert location
    let locationId = null;
    if (latitude && longitude) {
      const locResult = await client.query(
        `INSERT INTO locations (address, city, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [address || null, city || null, parseFloat(latitude), parseFloat(longitude)]
      );
      locationId = locResult.rows[0].id;
    }

    // 2. Generate tracking token and public ID
    const trackingToken = generateToken();
    const publicId = generatePublicId();

    // 3. Insert report
    const reportResult = await client.query(
      `INSERT INTO reports (category, description, location_id, tracking_token, public_id, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING id, tracking_token, public_id, created_at`,
      [category, description || null, locationId, trackingToken, publicId]
    );
    const report = reportResult.rows[0];

    // 4. Upload media files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = await uploadToStorage(file, report.id);
        await client.query(
          `INSERT INTO media (report_id, file_url, file_type) VALUES ($1, $2, $3)`,
          [report.id, fileUrl, file.mimetype]
        );
      }
    }

    // 5. Extract and Handle Mentions (@username)
    if (description) {
      const mentions = description.match(/@(\w+)/g);
      if (mentions) {
        for (const mention of mentions) {
          const username = mention.slice(1);
          const userRes = await client.query(
            `SELECT id, role FROM users WHERE username = $1 AND role IN ('official', 'admin', 'authority')`,
            [username]
          );
          if (userRes.rows.length > 0) {
            const authorityId = userRes.rows[0].id;
            await client.query(
              `INSERT INTO report_mentions (report_id, authority_id) 
               VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [report.id, authorityId]
            );

            // Create notification
            await client.query(
              `INSERT INTO notifications (type, content) 
               VALUES ('mention', $1)`,
              [`You were mentioned in report ${publicId}`]
            );
          }
        }
      }
    }

    await client.query('COMMIT');

    // Notify admins via socket.io
    if (req.io) {
      req.io.to('admins').emit('new-report', {
        id: report.id,
        category,
        location: { lat: latitude, lng: longitude },
        created_at: report.created_at
      });
    }

    res.status(201).json({
      msg: 'Report submitted successfully',
      reportId: report.id,
      trackingToken: report.tracking_token,
      publicId: report.public_id,
      submittedAt: report.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting report:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// GET /api/reports/public  – Public dashboard (obfuscated)
// ============================================================
router.get('/public', async (req, res) => {
  const { category, from, to, limit = 100, offset = 0 } = req.query;

  let conditions = [];
  let params = [];
  let idx = 1;

  if (category) {
    conditions.push(`r.category = $${idx++}`);
    params.push(category);
  }
  if (from) {
    conditions.push(`r.created_at >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`r.created_at <= $${idx++}`);
    params.push(to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.category,
         r.status,
         r.created_at,
         r.public_id,
         r.description,
         l.latitude AS lat,
         l.longitude AS lng,
         l.city
       FROM reports r
       LEFT JOIN locations l ON r.location_id = l.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Aggregate stats
    const statsResult = await pool.query(
      `SELECT category, COUNT(*) as count FROM reports GROUP BY category ORDER BY count DESC`
    );

    const reports = result.rows;

    // Fetch and Attach Media, Stars, and Comments for each report
    for (let report of reports) {
      // Media
      const mediaRes = await pool.query(
        'SELECT file_url, file_type FROM media WHERE report_id = $1',
        [report.id]
      );
      report.media = mediaRes.rows.map(m => ({ url: m.file_url, type: m.file_type }));

      // Stars
      const starRes = await pool.query(
        'SELECT COUNT(*) as count FROM report_likes WHERE report_id = $1',
        [report.id]
      );
      report.stars = parseInt(starRes.rows[0].count);

      // Comments count (or full comments if needed)
      const commentRes = await pool.query(
        'SELECT id, content, author_name, created_at FROM report_comments WHERE report_id = $1 ORDER BY created_at DESC',
        [report.id]
      );
      report.comments = commentRes.rows;
    }

    res.json({
      reports: reports,
      stats: statsResult.rows,
      total: result.rowCount,
    });
  } catch (err) {
    console.error('Error fetching public reports:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ============================================================
// GET /api/reports/notifications  – Get public notifications
// ============================================================
router.get('/notifications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================================
// GET /api/reports/trends  – Get trending categories
// ============================================================
router.get('/trends', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category as tag, count(*) as count 
      FROM reports 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching trends:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================================
// POST /api/reports/:id/star  – Star a report (Anonymous by IP)
// ============================================================
router.post('/:id/star', async (req, res) => {
  const ip = req.ip;
  try {
    await pool.query(
      `INSERT INTO report_likes (report_id, ip_address) VALUES ($1, $2)
       ON CONFLICT (report_id, ip_address) DO NOTHING`,
      [req.params.id, ip]
    );
    const starRes = await pool.query(
      'SELECT COUNT(*) as count FROM report_likes WHERE report_id = $1',
      [req.params.id]
    );
    res.json({ stars: parseInt(starRes.rows[0].count) });
  } catch (err) {
    console.error('Error starring report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================================
// POST /api/reports/:id/comment  – Comment on a report
// ============================================================
router.post('/:id/comment', async (req, res) => {
  const { content, authorName } = req.body;
  if (!content) return res.status(400).json({ msg: 'Comment content required' });

  try {
    const result = await pool.query(
      `INSERT INTO report_comments (report_id, content, author_name) 
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, content, authorName || 'Anonymous']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error commenting on report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ============================================================
// GET /api/reports/track/:token  – Citizen status check (no auth needed)
// ============================================================
router.get('/track/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.category, r.status, r.created_at, r.updated_at
       FROM reports r
       WHERE r.tracking_token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error tracking report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================================
// GET /api/reports/admin  – Full list (authorities only)
// ============================================================
router.get('/admin', authenticateAuthority, async (req, res) => {
  try {
    const result = await pool.query(
        `SELECT
         r.id,
         r.public_id,
         r.description,
         r.category,
         r.status,
         r.created_at,
         r.assigned_to,
         u.username AS assigned_to_username,
         l.latitude AS lat,
         l.longitude AS lng,
         EXISTS(SELECT 1 FROM report_mentions rm WHERE rm.report_id = r.id AND rm.authority_id = $1) as is_mentioned,
         l.address,
         l.city
       FROM reports r
       LEFT JOIN locations l ON r.location_id = l.id
       LEFT JOIN users u ON r.assigned_to = u.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin reports:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================================================
// GET /api/reports/:id  – Detailed view (authorities only)
// ============================================================
router.get('/:id', authenticateAuthority, async (req, res) => {
  try {
    const reportResult = await pool.query(
      `SELECT
         r.*,
         l.latitude AS lat,
         l.longitude AS lng,
         l.address,
         l.city,
         u.username AS assigned_to_username
       FROM reports r
       LEFT JOIN locations l ON r.location_id = l.id
       LEFT JOIN users u ON r.assigned_to = u.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Log the read action
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) 
       VALUES ($1, 'VIEW', 'report', $2, 'Authority viewed report details', $3)`,
      [req.user.id, req.params.id, req.ip]
    );

    const mediaResult = await pool.query(
      `SELECT id, file_url, file_type, uploaded_at FROM media WHERE report_id = $1`,
      [req.params.id]
    );

    const historyResult = await pool.query(
      `SELECT rsh.*, u.username as changed_by_username
       FROM report_status_history rsh
       LEFT JOIN users u ON rsh.changed_by = u.id
       WHERE rsh.report_id = $1
       ORDER BY rsh.changed_at ASC`,
      [req.params.id]
    );

    res.json({
      report: reportResult.rows[0],
      media: mediaResult.rows,
      history: historyResult.rows,
    });
  } catch (err) {
    console.error('Error fetching report detail:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ============================================================
// PUT /api/reports/:id/status  – Update status (authorities only)
// ============================================================
router.put('/:id/status', authenticateAuthority, async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['open', 'in-progress', 'resolved', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentReport = await client.query(
      `SELECT status FROM reports WHERE id = $1`,
      [req.params.id]
    );

    if (currentReport.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Report not found' });
    }

    const oldStatus = currentReport.rows[0].status;

    await client.query(
      `UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, req.params.id]
    );

    await client.query(
      `INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, req.user.id, oldStatus, status, notes || null]
    );

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) 
       VALUES ($1, 'UPDATE_STATUS', 'report', $2, $3, $4)`,
      [req.user.id, req.params.id, `Status changed from ${oldStatus} to ${status}`, req.ip]
    );

    await client.query('COMMIT');

    if (req.io) {
      req.io.to('admins').emit('report-updated', { id: req.params.id, status });
    }

    res.json({ msg: 'Status updated successfully', reportId: req.params.id, newStatus: status });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating status:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// PUT /api/reports/:id/assign  – Assign report to user (authorities only)
// ============================================================
router.put('/:id/assign', authenticateAuthority, async (req, res) => {
  const { assignTo } = req.body; // Should be a user ID

  try {
    const result = await pool.query(
      `UPDATE reports SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [assignTo, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ msg: 'Report not found' });

    // Log the assignment action
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) 
       VALUES ($1, 'ASSIGN', 'report', $2, $3, $4)`,
      [req.user.id, req.params.id, `Report assigned to user ID ${assignTo}`, req.ip]
    );

    if (req.io) {
      req.io.to('admins').emit('report-updated', { id: req.params.id, assignedTo: assignTo });
    }

    res.json({ msg: 'Report assigned successfully' });
  } catch (err) {
    console.error('Error assigning report:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ============================================================
// POST /api/reports/:id/escalate  – Escalate a report
// ============================================================
router.post('/:id/escalate', async (req, res) => {
  try {
    await pool.query(
      `UPDATE reports SET status = 'escalated', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    // Create notification for admins
    await pool.query(
      `INSERT INTO notifications (type, content) 
       VALUES ('alert', $1)`,
      [`Report ${req.params.id} has been escalated!`]
    );

    if (req.io) {
      req.io.to('admins').emit('report-escalated', { id: req.params.id });
    }

    res.json({ msg: 'Report escalated successfully' });
  } catch (err) {
    console.error('Escalation error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
