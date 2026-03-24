const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this to FRONTEND_URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware to expose io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket setup
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Authorities join an 'admins' room
  socket.on('join-admins', () => {
    socket.join('admins');
    console.log(`Socket ${socket.id} joined 'admins' room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', version: '1.0.0' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ 
    msg: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`CIVIFIX Backend API running on port ${PORT}`);
});
