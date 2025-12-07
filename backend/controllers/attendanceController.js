const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Mark attendance for a class
// @route   POST /api/attendance
// @access  Private (Faculty)
exports.markAttendance = async (req, res) => {
  try {
    const { year, division, courseId, date, attendance: attendanceRecords } = req.body;
    const facultyId = req.user._id || req.user.id;

    // Get faculty details
    const faculty = await User.findById(facultyId);
    const department = faculty.facultyInfo?.department || faculty.requestedDepartment;

    // Normalize attendance records to match schema { student, status }
    const normalizedRecords = (attendanceRecords || [])
      .map(r => ({
        student: r.student || r.studentId,
        status: r.status || 'present'
      }))
      .filter(r => !!r.student);

    if (!normalizedRecords.length) {
      return res.status(400).json({ success: false, message: 'No attendance records provided' });
    }

    // Calculate counts
    const presentCount = normalizedRecords.filter(r => r.status === 'present').length;
    const absentCount = normalizedRecords.filter(r => r.status === 'absent').length;

    // Create attendance record
    const attendance = await Attendance.create({
      faculty: facultyId,
      course: courseId,
      department,
      year,
      division,
      date: new Date(date),
      records: normalizedRecords,
      totalStudents: normalizedRecords.length,
      presentCount,
      absentCount
    });

    await attendance.populate('course', 'courseCode courseName');

    res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking attendance'
    });
  }
};

// @desc    Get student's own attendance
// @route   GET /api/attendance/student/my-attendance
// @access  Private (Student)
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;

    // Get all attendance records for this student
    const attendanceRecords = await Attendance.find({
      'records.student': studentId
    }).populate('course', 'courseCode courseName courseType credits semester');

    // Group by course and calculate statistics
    const courseAttendance = {};

    attendanceRecords.forEach(record => {
      if (!record.course) return;

      const courseId = record.course._id.toString();
      
      if (!courseAttendance[courseId]) {
        courseAttendance[courseId] = {
          courseId: record.course._id,
          courseCode: record.course.courseCode,
          courseName: record.course.courseName,
          courseType: record.course.courseType,
          credits: record.course.credits,
          semester: record.course.semester,
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0
        };
      }

      // Find student's record in this attendance
      const studentRecord = record.records.find(r => r.student.toString() === studentId);
      
      if (studentRecord) {
        courseAttendance[courseId].totalClasses++;
        
        if (studentRecord.status === 'present') {
          courseAttendance[courseId].presentCount++;
        } else if (studentRecord.status === 'absent') {
          courseAttendance[courseId].absentCount++;
        } else if (studentRecord.status === 'late') {
          courseAttendance[courseId].lateCount++;
        }
      }
    });

    // Convert to array
    const attendanceData = Object.values(courseAttendance);

    res.status(200).json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance'
    });
  }
};

// @desc    Get attendance for a specific course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Faculty, Student)
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { course: courseId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('faculty', 'firstName lastName')
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching course attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance'
    });
  }
};

// @desc    Get attendance statistics for faculty
// @route   GET /api/attendance/faculty/stats
// @access  Private (Faculty)
exports.getFacultyAttendanceStats = async (req, res) => {
  try {
    const facultyId = req.user._id || req.user.id;

    const stats = await Attendance.aggregate([
      { $match: { faculty: facultyId } },
      {
        $group: {
          _id: '$course',
          totalClasses: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' },
          totalPresent: { $sum: '$presentCount' },
          totalAbsent: { $sum: '$absentCount' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching faculty stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching statistics'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Faculty)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { records } = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update records
    attendance.records = records;
    attendance.presentCount = records.filter(r => r.status === 'present').length;
    attendance.absentCount = records.filter(r => r.status === 'absent').length;

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating attendance'
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Faculty, Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting attendance'
    });
  }
};
