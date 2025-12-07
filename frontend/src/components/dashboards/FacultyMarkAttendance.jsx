import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const FacultyMarkAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const navigate = useNavigate();

  // Derived state for dropdown options (normalize year labels)
  const normalizeYear = (y) => (y === 'FRY' || y === 'Final Year') ? 'TY' : y;
  const availableYears = [...new Set(assignments.map(a => normalizeYear(a.year)))];
  const availableDivisions = selectedYear 
    ? [...new Set(assignments.filter(a => normalizeYear(a.year) === selectedYear).flatMap(a => a.divisions))]
    : [];
  const availableCoursesRaw = (selectedYear && selectedDivision)
    ? assignments.filter(a => normalizeYear(a.year) === selectedYear && a.divisions.includes(selectedDivision))
        .flatMap(a => a.courses.map(c => ({ course: c, year: normalizeYear(a.year), divisions: a.divisions })))
    : [];
  const availableCourses = availableCoursesRaw.filter((item, idx, self) =>
    item.course && self.findIndex(x => x.course._id === item.course._id) === idx
  ).map(item => ({
    _id: item.course._id,
    label: `${item.year} / ${selectedDivision} / ${item.course.courseName}`,
    courseCode: item.course.courseCode,
    courseName: item.course.courseName
  }));

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedDivision && selectedCourse) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedYear, selectedDivision, selectedCourse]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/work-assignments/my-assignments');
      if (response.data.success) {
        setAssignments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await api.get('/users/faculty/students');
      if (response.data.success) {
        // Filter students by selected year and division
        const filteredStudents = response.data.data.filter(student => {
          const studentYear = (student.studentInfo?.classYear || '').toString();
          const normalizedSelected = selectedYear;
          return studentYear === normalizedSelected &&
                 student.studentInfo?.division === selectedDivision;
        });
        setStudents(filteredStudents);
        
        // Initialize attendance state
        const initialAttendance = {};
        filteredStudents.forEach(student => {
          initialAttendance[student._id] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedYear || !selectedDivision || !selectedCourse) {
      alert('Please select year, division, and course');
      return;
    }

    // Prepare attendance data
    const attendanceData = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id] || 'present'
    }));

    try {
      // TODO: Create attendance API endpoint
      await api.post('/attendance', {
        year: selectedYear,
        division: selectedDivision,
        courseId: selectedCourse,
        date: new Date().toISOString(),
        attendance: attendanceData
      });
      
      alert('Attendance marked successfully!');
      
      // Reset selections
      setSelectedYear('');
      setSelectedDivision('');
      setSelectedCourse('');
      setStudents([]);
      setAttendance({});
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>✅ Mark Attendance</h1>
          <p style={{ margin: 0, color: '#666' }}>Mark student attendance for your classes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/dashboard/faculty')} 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 20px', background: '#6b7280' }}
          >
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Main Attendance Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '2px solid #e5e7eb',
          padding: '30px',
          minHeight: '600px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Dropdown Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            {/* Select Year */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Select Year
              </label>
              <select
                className="form-control"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedDivision('');
                  setSelectedCourse('');
                }}
                style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              >
                <option value="">-- Select Year --</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Select Division */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Select Division
              </label>
              <select
                className="form-control"
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedCourse('');
                }}
                disabled={!selectedYear}
                style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              >
                <option value="">-- Select Division --</option>
                {availableDivisions.map(division => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
            </div>

            {/* Select Course */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Select Course
              </label>
              <select
                className="form-control"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={!selectedYear || !selectedDivision}
                style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              >
                <option value="">-- Select Course --</option>
                {availableCourses.map(opt => (
                  <option key={opt._id} value={opt._id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students List */}
          {loadingStudents ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              <h3>Loading students...</h3>
            </div>
          ) : students.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  Students List ({students.length} students)
                </h3>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Date: {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '12px' }}>Roll No</th>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id}>
                        <td style={{ padding: '12px' }}>{student.studentInfo?.rollNo || '-'}</td>
                        <td style={{ padding: '12px' }}>{student.firstName} {student.lastName}</td>
                        <td style={{ padding: '12px' }}>{student.email}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: attendance[student._id] === 'present' ? '#dcfce7' : '#f3f4f6',
                              border: attendance[student._id] === 'present' ? '2px solid #16a34a' : '2px solid #d1d5db'
                            }}>
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                value="present"
                                checked={attendance[student._id] === 'present'}
                                onChange={() => handleAttendanceChange(student._id, 'present')}
                              />
                              <span style={{ color: attendance[student._id] === 'present' ? '#16a34a' : '#666' }}>
                                Present
                              </span>
                            </label>

                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: attendance[student._id] === 'absent' ? '#fee2e2' : '#f3f4f6',
                              border: attendance[student._id] === 'absent' ? '2px solid #dc2626' : '2px solid #d1d5db'
                            }}>
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                value="absent"
                                checked={attendance[student._id] === 'absent'}
                                onChange={() => handleAttendanceChange(student._id, 'absent')}
                              />
                              <span style={{ color: attendance[student._id] === 'absent' ? '#dc2626' : '#666' }}>
                                Absent
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                  onClick={handleSubmitAttendance}
                  className="btn-primary"
                  style={{ 
                    width: 'auto',
                    padding: '14px 40px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  Submit Attendance
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              color: '#666' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3>Select Year, Division, and Course</h3>
              <p>Choose the filters above to view students and mark attendance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyMarkAttendance;
