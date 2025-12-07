const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE']
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    min: 0
  },
  courseType: {
    type: String,
    enum: ['Theory', 'Lab', 'Theory + Lab', 'Project'],
    default: 'Theory'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
