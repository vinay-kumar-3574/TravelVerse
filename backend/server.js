const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();
// Connect to MongoDB directly in server.js
const connectDB = async () => {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('❌ MONGODB_URI is not set in environment variables.');
      }
  
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected`);
    } catch (error) {
      console.error('🔥 Database connection error:', error.message);
      setTimeout(connectDB, 5000); // retry every 5 seconds
    }
  };

// Import routes (paths are relative to backend root)
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const tripRoutes = require('./src/routes/trips');
const transportRoutes = require('./src/routes/transport');
const hotelRoutes = require('./src/routes/hotels');
const bookingRoutes = require('./src/routes/bookings');
const paymentRoutes = require('./src/routes/payments');
const dashboardRoutes = require('./src/routes/dashboard');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { authMiddleware } = require('./src/middleware/auth');

const app = express();

// Connect to DB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS - Allow both frontend ports
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
    credentials: true
  }));



// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TravelVerse API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes); // Public routes (no auth required)
app.use('/api/users', authMiddleware, userRoutes); // Protected routes
app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/transport', authMiddleware, transportRoutes);
app.use('/api/hotels', authMiddleware, hotelRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Custom error handler middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TravelVerse Server running on port ${PORT}`);
  });

module.exports = app;
