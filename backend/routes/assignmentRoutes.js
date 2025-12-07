const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');
const Assignment = require('../models/Assignment');

const router = express.Router();

// Multer memory storage; limit to images/PDF only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png','image/jpeg','image/jpg','image/webp','application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only images or PDF allowed'));
  }
});

// POST /api/assignments/upload
router.post('/upload', protect, authorize('faculty'), upload.single('file'), async (req, res) => {
  try {
    const { year, division, courseId, description } = req.body;
    if (!req.file) return res.status(400).json({ success:false, message:'File is required' });

    // Upload to Cloudinary
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'college-crm/assignments',
      resource_type: req.file.mimetype === 'application/pdf' ? 'raw' : 'image',
      use_filename: true,
      unique_filename: true,
    });

    const doc = await Assignment.create({
      faculty: req.user._id,
      course: courseId,
      year,
      division,
      description,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ success:true, data: doc });
  } catch (err) {
    console.error('Assignment upload error:', err);
    res.status(500).json({ success:false, message: err.message || 'Upload failed' });
  }
});

// GET /api/assignments/my (student view)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    // Fetch full user from database to get studentInfo
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id);
    
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('Student user:', fullUser);
    console.log('Student info:', fullUser.studentInfo);
    
    const { classYear, division } = fullUser.studentInfo || {};
    
    if (!classYear || !division) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student year and division not found. Please contact admin.' 
      });
    }
    
    const data = await Assignment.find({ year: classYear, division })
      .populate('course','courseCode courseName')
      .populate('faculty','firstName lastName facultyInfo')
      .sort({ createdAt: -1 });
      
    console.log(`Found ${data.length} assignments for ${classYear} - ${division}`);
    
    res.json({ success:true, data });
  } catch (err) {
    console.error('Error fetching student assignments:', err);
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/assignments/:id/submit (student submit assignment)
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success:false, message:'File is required' });

    // Upload to Cloudinary - convert images to PDF
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadOptions = {
      folder: 'college-crm/submissions',
      use_filename: true,
      unique_filename: true,
    };

    // If it's a PDF, upload as raw; if image, upload and convert to PDF
    if (req.file.mimetype === 'application/pdf') {
      uploadOptions.resource_type = 'raw';
    } else {
      uploadOptions.resource_type = 'image';
      uploadOptions.format = 'pdf'; // Convert image to PDF
    }

    const result = await cloudinary.uploader.upload(base64, uploadOptions);

    // Find assignment and add submission
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success:false, message:'Assignment not found' });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      // Delete old file from cloudinary
      if (existingSubmission.publicId) {
        await cloudinary.uploader.destroy(existingSubmission.publicId, { resource_type: 'raw' });
      }
      // Update existing submission
      existingSubmission.fileUrl = result.secure_url;
      existingSubmission.publicId = result.public_id;
      existingSubmission.mimeType = 'application/pdf';
      existingSubmission.submittedAt = new Date();
    } else {
      // Add new submission
      assignment.submissions.push({
        student: req.user._id,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        mimeType: 'application/pdf',
      });
    }

    await assignment.save();
    res.json({ success:true, message: 'Assignment submitted successfully' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success:false, message: err.message || 'Submission failed' });
  }
});

// GET /api/assignments/submissions (faculty view submissions by filters)
router.get('/submissions', protect, authorize('faculty'), async (req, res) => {
  try {
    const { year, division, courseId } = req.query;
    
    if (!year || !division || !courseId) {
      return res.status(400).json({ success:false, message:'Year, division, and courseId are required' });
    }

    // Find all assignments matching the filters
    const assignments = await Assignment.find({ 
      faculty: req.user._id,
      year, 
      division, 
      course: courseId 
    }).populate('submissions.student', 'firstName lastName email studentInfo prn');

    // Collect all submissions across all matching assignments
    const allSubmissions = [];
    assignments.forEach(assignment => {
      assignment.submissions.forEach(sub => {
        allSubmissions.push({
          _id: sub._id,
          student: {
            name: sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : 'Unknown',
            prn: sub.student?.prn || sub.student?.studentInfo?.prn || 'N/A',
            email: sub.student?.email
          },
          fileUrl: sub.fileUrl,
          publicId: sub.publicId,
          mimeType: sub.mimeType,
          submittedAt: sub.submittedAt,
          assignmentTitle: assignment.description
        });
      });
    });

    res.json({ success:true, data: allSubmissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/assignments/:id/submissions (faculty view submissions for specific assignment)
router.get('/:id/submissions', protect, authorize('faculty'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'firstName lastName email studentInfo');
    
    if (!assignment) {
      return res.status(404).json({ success:false, message:'Assignment not found' });
    }

    res.json({ success:true, data: assignment.submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/assignments/faculty/uploaded (faculty view their uploaded assignments)
router.get('/faculty/uploaded', protect, authorize('faculty'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ faculty: req.user._id })
      .populate('course', 'courseCode courseName')
      .populate('submissions.student', 'firstName lastName email studentInfo')
      .sort({ createdAt: -1 });
    
    res.json({ success:true, data: assignments });
  } catch (err) {
    console.error('Error fetching faculty assignments:', err);
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;
