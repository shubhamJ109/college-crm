const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// controllers you’ll create later:
const {
  listAccessRequests,
  confirmStaff,
  issueEmployeeId,
  sendEmployeeIdEmail,
  verifyEmployeeId // used by faculty
} = require('../controllers/accessController');

router.get('/access/requests', protect, authorize('admin','super_admin'), listAccessRequests);
router.put('/access/confirm/:id', protect, authorize('admin','super_admin'), confirmStaff);
router.put('/access/issue-id/:id', protect, authorize('admin','super_admin'), issueEmployeeId);
router.post('/access/send-id-email/:id', protect, authorize('admin','super_admin'), sendEmployeeIdEmail);

// Faculty uses this to unlock:
router.post('/access/verify-employee-id', protect, verifyEmployeeId);


const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  saveHODSelectedCourses,
  getFacultyStudents
} = require('../controllers/userController');

// All routes are protected
router.use(protect);

// Get all users (admin only)
router.get('/', authorize('admin', 'super_admin'), getAllUsers);

// Get users by role
router.get('/role/:role', authorize('admin', 'super_admin', 'principal', 'hod'), getUsersByRole);

// Get students for the logged in faculty (also allow HOD to access)
router.get('/faculty/students', authorize('faculty', 'hod'), getFacultyStudents);

// HOD selected courses
router.put('/hod/selected-courses', authorize('hod'), saveHODSelectedCourses);

// Get, update, delete user by ID
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('admin', 'super_admin'), deleteUser);

// Explicit delete route
router.delete('/:id', protect, authorize('admin','super_admin'), deleteUser);

module.exports = router;
