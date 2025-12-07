const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// Course routes
router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin', 'super_admin'), createCourse);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('admin', 'super_admin'), updateCourse)
  .delete(protect, authorize('admin', 'super_admin'), deleteCourse);

module.exports = router;
