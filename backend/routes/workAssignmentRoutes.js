const express = require('express');
const router = express.Router();
const WorkAssignment = require('../models/WorkAssignment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/work-assignments
// @desc    Create work assignments
// @access  Private (HOD)
router.post('/', protect, authorize('hod'), async (req, res) => {
  try {
    const { facultyId, assignments } = req.body;
    
    // Fetch full user object to get hodInfo
    const hodUser = await User.findById(req.user._id);
    const department = hodUser?.hodInfo?.department || hodUser?.requestedDepartment;

    console.log('Creating work assignments...');
    console.log('HOD User:', hodUser?.firstName, hodUser?.lastName);
    console.log('Faculty ID:', facultyId);
    console.log('Department:', department);
    console.log('Number of assignments:', assignments?.length);

    if (!facultyId || !assignments || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID and assignments are required'
      });
    }

    // Create all assignments
    const createdAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        // Extract course IDs properly
        const courseIds = assignment.courses.map(c => {
          if (typeof c === 'string') return c;
          if (c._id) return c._id;
          return c;
        });

        console.log('Creating assignment:', {
          faculty: facultyId,
          year: assignment.year,
          divisions: assignment.divisions,
          courses: courseIds
        });

        const workAssignment = await WorkAssignment.create({
          faculty: facultyId,
          hod: req.user._id,
          department,
          year: assignment.year,
          divisions: assignment.divisions,
          courses: courseIds,
          description: assignment.description,
          status: 'Active'
        });
        
        console.log('Assignment created:', workAssignment._id);
        
        // Populate courses before returning
        await workAssignment.populate('courses', 'courseCode courseName semester credits');
        return workAssignment;
      })
    );

    console.log('All assignments created successfully:', createdAssignments.length);

    res.status(201).json({
      success: true,
      data: createdAssignments,
      message: 'Work assignments created successfully'
    });
  } catch (error) {
    console.error('Error creating work assignments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating work assignments'
    });
  }
});

// @route   GET /api/work-assignments/faculty/:facultyId
// @desc    Get all work assignments for a faculty (ALL assignments - permanent)
// @access  Private (HOD, Faculty)
router.get('/faculty/:facultyId', protect, async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log('Fetching ALL assignments for faculty:', facultyId);

    // Get ALL assignments (removed status filter for permanent display)
    const assignments = await WorkAssignment.find({ 
      faculty: facultyId
    })
    .populate('courses', 'courseCode courseName semester credits courseType')
    .populate('hod', 'firstName lastName')
    .sort({ createdAt: -1 });

    console.log('Found total assignments:', assignments.length);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching work assignments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching work assignments'
    });
  }
});

// @route   GET /api/work-assignments/my-assignments
// @desc    Get ALL work assignments for logged-in faculty (permanent - always visible)
// @access  Private (Faculty)
router.get('/my-assignments', protect, authorize('faculty'), async (req, res) => {
  try {
    console.log('Fetching ALL assignments for faculty:', req.user._id);
    console.log('Faculty name:', req.user.firstName, req.user.lastName);
    
    // Get ALL assignments (removed status filter for permanent display)
    const assignments = await WorkAssignment.find({ 
      faculty: req.user._id
    })
    .populate('courses', 'courseCode courseName semester credits courseType')
    .populate('hod', 'firstName lastName')
    .sort({ createdAt: -1 });

    console.log('Found total assignments:', assignments.length);
    console.log('Assignments:', assignments);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching my assignments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignments'
    });
  }
});

// @route   GET /api/work-assignments/department/:department
// @desc    Get all work assignments for a department
// @access  Private (HOD)
router.get('/department/:department', protect, authorize('hod'), async (req, res) => {
  try {
    const { department } = req.params;

    const assignments = await WorkAssignment.find({ 
      department,
      status: 'Active'
    })
    .populate('faculty', 'firstName lastName email facultyInfo')
    .populate('courses', 'courseCode courseName semester credits')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching department assignments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignments'
    });
  }
});

// @route   DELETE /api/work-assignments/:id
// @desc    Delete a work assignment - DISABLED FOR PERMANENT ASSIGNMENTS
// @access  Private (HOD)
// NOTE: This endpoint is disabled to ensure assignments are permanent
// Assignments will remain in the database and always be visible
/*
router.delete('/:id', protect, authorize('hod'), async (req, res) => {
  try {
    const assignment = await WorkAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await assignment.deleteOne();

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting assignment'
    });
  }
});
*/

// @route   PATCH /api/work-assignments/:id/status
// @desc    Update assignment status
// @access  Private (HOD)
router.patch('/:id/status', protect, authorize('hod'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Active', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const assignment = await WorkAssignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment,
      message: 'Assignment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating assignment status'
    });
  }
});

module.exports = router;
