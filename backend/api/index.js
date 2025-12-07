const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/departments', require('../routes/departmentRoutes'));
app.use('/api/academics', require('../routes/academicsRoutes'));
app.use('/api/courses', require('../routes/courseRoutes'));
app.use('/api/work-assignments', require('../routes/workAssignmentRoutes'));
app.use('/api/attendance', require('../routes/attendanceRoutes'));
app.use('/api/assignments', require('../routes/assignmentRoutes'));

// Root route
app.get('/api', (req, res) => {
  res.json({
    message: '🎓 College CRM API',
    version: '1.0.0',
    status: 'Running on Vercel',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      departments: '/api/departments',
      academics: '/api/academics',
      courses: '/api/courses',
      workAssignments: '/api/work-assignments',
      attendance: '/api/attendance',
      assignments: '/api/assignments'
    }
  });
});

// Error handler
app.use(errorHandler);

// Export for Vercel
module.exports = app;
