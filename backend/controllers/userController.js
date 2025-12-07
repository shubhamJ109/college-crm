const User = require('../models/User');
const WorkAssignment = require('../models/WorkAssignment');

// @desc    Get students for the logged in faculty
// @route   GET /api/users/faculty/students
// @access  Private (Faculty, HOD)
exports.getFacultyStudents = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    
    console.log('=== getFacultyStudents ===');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let userDepartment;
    let assignedYears = [];
    
    // Handle HOD - they see all students in their department
    if (userRole === 'hod') {
      userDepartment = user.hodInfo?.department || user.requestedDepartment;
      console.log('HOD Department:', userDepartment);
      
      if (!userDepartment) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: 'No department assigned to HOD'
        });
      }
      
      // HOD sees all years
      assignedYears = ['FY', 'SY', 'TY'];
      
    } else if (userRole === 'faculty') {
      // Handle Faculty - they see students based on work assignments
      userDepartment = user.facultyInfo?.department || user.requestedDepartment;
      console.log('Faculty Department:', userDepartment);
      
      if (!userDepartment) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: 'No department assigned to faculty'
        });
      }

      // Find work assignments for this faculty (assigned by HOD)
      const workAssignments = await WorkAssignment.find({ 
        faculty: userId,
        status: 'Active'
      });
      
      console.log('Work Assignments found:', workAssignments.length);

      if (!workAssignments || workAssignments.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: 'No work assignments found for this faculty'
        });
      }

      // Extract assigned years from work assignments
      assignedYears = [...new Set(workAssignments.map(wa => wa.year))];
      console.log('Assigned Years:', assignedYears);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Find students matching user's department AND assigned years
    const students = await User.find({
      role: 'student',
      status: 'Active',
      'studentInfo.department': userDepartment,
      'studentInfo.classYear': { $in: assignedYears }
    }).select('-password').sort({ 'studentInfo.rollNo': 1 });

    console.log('Students found:', students.length);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
      facultyDepartment: userDepartment,
      assignedYears
    });
  } catch (error) {
    console.error('Error in getFacultyStudents:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Super Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;
    delete req.body.email;  // Email change requires verification
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin, Super Admin)
exports.deleteUser = async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ success:false, message:'User not found' });
  await u.deleteOne();
  res.json({ success:true, message:'User deleted' });
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private
exports.getUsersByRole = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const query = { role: req.params.role };
    
    console.log('=== getUsersByRole ===');
    console.log('Role:', req.params.role);
    console.log('Department filter:', department);
    
    // Add department filter based on role
    if (department) {
      const departmentConditions = [];
      
      if (req.params.role === 'faculty') {
        departmentConditions.push(
          { 'facultyInfo.department': department },
          { 'requestedDepartment': department }
        );
      } else if (req.params.role === 'hod') {
        departmentConditions.push(
          { 'hodInfo.department': department },
          { 'requestedDepartment': department }
        );
      } else if (req.params.role === 'student') {
        departmentConditions.push(
          { 'studentInfo.department': department },
          { 'requestedDepartment': department }
        );
      }
      
      if (departmentConditions.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({ $or: departmentConditions });
      }
    }
    
    if (status) query.status = status;
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const users = await User.find(query).select('-password');
    
    // If fetching students, add assigned faculty information
    if (req.params.role === 'student') {
      const studentsWithFaculty = await Promise.all(users.map(async (student) => {
        const studentObj = student.toObject();
        
        if (studentObj.studentInfo?.department && studentObj.studentInfo?.classYear) {
          // Find faculty assigned to this department and year
          const workAssignments = await WorkAssignment.find({
            department: studentObj.studentInfo.department,
            year: studentObj.studentInfo.classYear,
            status: 'Active'
          }).populate('faculty', 'firstName lastName email userId');
          
          studentObj.assignedFaculty = workAssignments.map(wa => ({
            facultyId: wa.faculty?._id,
            facultyName: wa.faculty ? `${wa.faculty.firstName} ${wa.faculty.lastName}` : 'Unknown',
            facultyEmail: wa.faculty?.email,
            facultyUserId: wa.faculty?.userId,
            divisions: wa.divisions
          }));
        } else {
          studentObj.assignedFaculty = [];
        }
        
        return studentObj;
      }));
      
      console.log('Found users:', studentsWithFaculty.length);
      
      return res.status(200).json({
        success: true,
        count: studentsWithFaculty.length,
        data: studentsWithFaculty
      });
    }
    
    console.log('Found users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName}: facultyInfo.department=${u.facultyInfo?.department}, requestedDepartment=${u.requestedDepartment}`);
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save HOD selected courses
// @route   PUT /api/users/hod/selected-courses
// @access  Private (HOD only)
exports.saveHODSelectedCourses = async (req, res) => {
  try {
    const { selectedCourses } = req.body;
    
    console.log('=== saveHODSelectedCourses ===');
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    console.log('Selected Courses:', selectedCourses);
    console.log('Selected Courses type:', typeof selectedCourses);
    console.log('Selected Courses is array:', Array.isArray(selectedCourses));
    
    // Validate that selectedCourses is an array
    if (!Array.isArray(selectedCourses)) {
      console.error('Selected courses is not an array:', selectedCourses);
      return res.status(400).json({
        success: false,
        message: 'Selected courses must be an array'
      });
    }
    
    // Validate each course ID is a valid ObjectId
    const mongoose = require('mongoose');
    for (const courseId of selectedCourses) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.error('Invalid course ID:', courseId);
        return res.status(400).json({
          success: false,
          message: `Invalid course ID: ${courseId}`
        });
      }
    }
    
    // Find user first to ensure they exist
    let user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Current user hodInfo:', user.hodInfo);
    
    // Initialize hodInfo if it doesn't exist
    if (!user.hodInfo) {
      console.log('Initializing hodInfo...');
      user.hodInfo = {};
    }
    
    // Update selected courses
    user.hodInfo.selectedCourses = selectedCourses;
    
    console.log('About to save user with hodInfo.selectedCourses:', user.hodInfo.selectedCourses);
    
    // Save the user
    await user.save();
    
    console.log('User saved successfully');
    
    // Populate the selected courses for the response
    try {
      await user.populate('hodInfo.selectedCourses');
      console.log('Populated courses:', user.hodInfo.selectedCourses);
    } catch (populateError) {
      console.warn('Warning: Could not populate courses:', populateError.message);
      // Continue even if populate fails
    }
    
    console.log('=== saveHODSelectedCourses SUCCESS ===');
    
    res.status(200).json({
      success: true,
      message: 'Selected courses saved successfully',
      data: user
    });
  } catch (error) {
    console.error('=== saveHODSelectedCourses ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
