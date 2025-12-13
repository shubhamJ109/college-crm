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

// CORS Configuration - Allow both local and deployed frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://frontend-laj5cwnuc-shubham-jaitalkars-projects.vercel.app',
  'https://frontend-shubham-jaitalkars-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
