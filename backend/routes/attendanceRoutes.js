const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  markAttendance,
  getStudentAttendance,
  getCourseAttendance,
  getFacultyAttendanceStats,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

// Protect all routes
router.use(protect);

// @route   POST /api/attendance
// @desc    Mark attendance for a class
// @access  Private (Faculty)
router.post('/', authorize('faculty'), markAttendance);

// @route   GET /api/attendance/student/my-attendance
// @desc    Get student's own attendance
// @access  Private (Student)
router.get('/student/my-attendance', authorize('student'), getStudentAttendance);

// @route   GET /api/attendance/faculty/stats
// @desc    Get attendance statistics for faculty
// @access  Private (Faculty)
router.get('/faculty/stats', authorize('faculty'), getFacultyAttendanceStats);

// @route   GET /api/attendance/course/:courseId
// @desc    Get attendance for a specific course
// @access  Private (Faculty, Student, Admin)
router.get('/course/:courseId', getCourseAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Faculty)
router.put('/:id', authorize('faculty'), updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Faculty, Admin)
router.delete('/:id', authorize('faculty', 'admin', 'super_admin'), deleteAttendance);

module.exports = router;
