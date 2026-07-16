const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/printflow';

const safeURI = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log('Connecting to database URI:', safeURI);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded designs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('PrintFlow Backend API is running...');
});

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5050,
    socketTimeoutMS: 45000,
  });
  console.log('Successfully connected to MongoDB.');
  return mongoose.connection;
}

// Middleware to ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Listen if run locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
