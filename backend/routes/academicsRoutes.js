const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// controllers you’ll create later:
const {
  getAcademicCalendar,
  upsertAcademicCalendar,
  listCurriculums,
  approveDepartmentCurriculum,
  manageCoursePolicies
} = require('../controllers/academicsController');

// Read calendar (wide)
router.get('/calendar', protect, authorize('academic_dean','principal','admin','super_admin','hod','faculty','student'), getAcademicCalendar);

// Manage calendar (restricted)
router.post('/calendar', protect, authorize('academic_dean','principal','admin','super_admin'), upsertAcademicCalendar);

// Curriculum registry
router.get('/curriculums', protect, authorize('academic_dean','principal','admin','super_admin','hod'), listCurriculums);

// Approve dept curriculum
router.post('/curriculums/:deptId/approve', protect, authorize('academic_dean','principal','admin','super_admin'), approveDepartmentCurriculum);

// Course policies
router.post('/policies', protect, authorize('academic_dean','principal','admin','super_admin'), manageCoursePolicies);

module.exports = router;
