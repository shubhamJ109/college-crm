const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  year: { type: String, enum: ['FY', 'SY', 'TY'], required: true },
  division: { type: String, uppercase: true, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String },
  publicId: { type: String },
  mimeType: { type: String },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String },
    publicId: { type: String },
    mimeType: { type: String },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
