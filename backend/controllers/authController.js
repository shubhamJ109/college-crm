const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateUserId = require('../utils/generateUserId');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};



const holdRoles = ['principal','academic_dean','hod','faculty','student','accountant','librarian','placement_officer'];
 

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      role, 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      gender,
      dateOfBirth,
      address,
      ...roleSpecificData 
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Prepare additional info for userId generation
    let additionalInfo = {};
    if (role === 'student') {
      additionalInfo = {
        classYear: roleSpecificData.classYear,
        department: roleSpecificData.department,
        division: roleSpecificData.division,
        rollNo: roleSpecificData.rollNo
      };
    } else if (role === 'hod') {
      additionalInfo = {
        department: roleSpecificData.department
      };
    }
    
    // Generate userId
    const userId = await generateUserId(role, additionalInfo);
    
    // Prepare user data
    const userData = {
      userId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      gender,
      dateOfBirth,
      address
    };
    
    // Map role-specific data to correct nested field
    if (role === 'student') {
      userData.studentInfo = {
        department: roleSpecificData.department,
        classYear: roleSpecificData.classYear,
        division: roleSpecificData.division,
        rollNo: roleSpecificData.rollNo,
        semester: roleSpecificData.semester || 1,
        enrollmentDate: new Date()
      };
    } else if (role === 'faculty') {
      userData.facultyInfo = {
        employeeId: roleSpecificData.employeeId,
        departmentId: roleSpecificData.departmentId,
        department: roleSpecificData.department,
        designation: roleSpecificData.designation,
        qualification: roleSpecificData.qualification,
        experience: roleSpecificData.experience,
        joiningDate: new Date()
      };
      userData.requestedDepartment = roleSpecificData.department;
      userData.requestedRole = 'faculty';
    } else if (role === 'hod') {
      userData.hodInfo = {
        departmentId: roleSpecificData.departmentId,
        department: roleSpecificData.department,
        appointmentDate: new Date()
      };
      userData.requestedDepartment = roleSpecificData.department;
      userData.requestedRole = 'hod';
    } else if (role === 'parent') {
      userData.parentInfo = {
        occupation: roleSpecificData.occupation,
        children: roleSpecificData.children || []
      };
    } else if (role === 'accountant') {
      userData.accountantInfo = {
        employeeId: roleSpecificData.employeeId,
        joiningDate: new Date(),
        department: roleSpecificData.department
      };
    } else if (role === 'librarian') {
      userData.librarianInfo = {
        employeeId: roleSpecificData.employeeId,
        joiningDate: new Date()
      };
    } else if (role === 'placement_officer') {
      userData.placementInfo = {
        employeeId: roleSpecificData.employeeId,
        joiningDate: new Date(),
        department: roleSpecificData.department
      };
    } else if (['admin', 'principal', 'super_admin'].includes(role)) {
      userData.adminInfo = {
        employeeId: roleSpecificData.employeeId,
        joiningDate: new Date()
      };
    }else if (role === 'academic_dean') {
      userData.academicDeanInfo = {
      employeeId: roleSpecificData.employeeId,
      office: roleSpecificData.office,
      responsibilities: roleSpecificData.responsibilities || [],
      joiningDate: new Date()
      };
    }
    
    // Create user
    const user = await User.create(userData);
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: user.userId,
      role: user.role,
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.getFullName(),
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ $or: [{ email: loginId }, { userId: loginId }] }).select('+password');
    if (!user) return res.status(400).json({ success:false, message:'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success:false, message:'Invalid credentials' });

    if (holdRoles.includes(user.role)) {
      if (!user.requestedAt) {
        user.requestedAt = new Date();
        user.requestedRole = user.role;
        user.requestedDepartment =
          user.facultyInfo?.department ||
          user.hodInfo?.department ||
          user.hodInfo?.departmentId ||
          user.studentInfo?.department ||
          '';
        await user.save();
      }

      // Issue a short-lived “hold” token so /me and /verify-id can be called
      const tempToken = jwt.sign({ id: user._id, role: user.role, scope: 'hold' }, process.env.JWT_SECRET, { expiresIn: '15m' });

      // Gate 1: admin approval
      if (!user.isApproved) {
        return res.status(403).json({
          success:false, hold:true, stage:'awaiting_admin_approval', token: tempToken,
          user:{ name:`${user.firstName} ${user.lastName}`, role:user.role, department:user.requestedDepartment, userId:user.userId }
        });
      }

      // Gate 2: email must have been sent first; then require employee ID input
      if (!user.employeeIdVerified) {
        const stage = user.employeeIdEmailSentAt ? 'awaiting_employee_id_input' : 'awaiting_admin_approval';
        return res.status(403).json({
          success:false, hold:true, stage, token: tempToken,
          user:{ name:`${user.firstName} ${user.lastName}`, role:user.role, department:user.requestedDepartment, userId:user.userId }
        });
      }
    }
    
    // Fully authenticated path (no semicolon here)
    const token = jwt.sign({ id:user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn:'7d' });
    res.json({ success:true, token, user:{ id:user._id, role:user.role, email:user.email, firstName:user.firstName, lastName:user.lastName } });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current logged in user (detailed for client verify flow)
// @route   GET /api/auth/me
// @access  Private (supports hold tokens)
exports.me = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    // Try to populate courses, but don't fail if it errors
    try {
      await user.populate('hodInfo.selectedCourses');
    } catch (populateError) {
      console.warn('Warning: Could not populate courses for user:', populateError.message);
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        facultyInfo: user.facultyInfo,
        studentInfo: user.studentInfo,
        hodInfo: user.hodInfo,
        parentInfo: user.parentInfo,
        accountantInfo: user.accountantInfo,
        librarianInfo: user.librarianInfo,
        placementInfo: user.placementInfo,
        adminInfo: user.adminInfo,
        requestedDepartment: user.requestedDepartment,
        requestedRole: user.requestedRole,
        isApproved: user.isApproved,
        employeeIdIssued: user.employeeIdIssued,
        employeeIdEmailSentAt: user.employeeIdEmailSentAt,
        employeeIdVerified: user.employeeIdVerified
      }
    });
  } catch (error) {
    console.error('Error in me():', error);
    res.status(500).json({ success:false, message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
