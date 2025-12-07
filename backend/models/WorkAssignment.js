const mongoose = require('mongoose');

const workAssignmentSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['FY', 'SY', 'TY', 'FRY', 'Final Year']
  },
  divisions: [{
    type: String,
    required: true
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkAssignment', workAssignmentSchema);
