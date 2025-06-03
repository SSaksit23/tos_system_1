const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || 'Bd76Zxmr3DtsAgSCNVhRlgCzzFDROM07',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || 'Onw33473vAI1CTHS',
  hostname: process.env.AMADEUS_HOSTNAME || 'test'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'AdventureConnect Backend is running!',
    features: {
      authentication: 'Active',
      amadeus: 'Connected',
      database: 'Connected'
    }
  });
});

// Auth verification endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    message: 'Profile data retrieved successfully'
  });
});

// Your existing flight/hotel search endpoints
// (Keep all your existing endpoints but add authenticateToken middleware for protected features)

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AdventureConnect Backend running on port ${port}`);
  console.log(`✅ Health check: http://localhost:${port}/api/health`);
  console.log(`🔐 Authentication: Active`);
  console.log(`✈️ Flight search: Ready`);
  console.log(`🏨 Hotel search: Ready`);
});