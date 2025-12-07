import { useEffect, useState } from 'react';
import { getStudentAttendance } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await getStudentAttendance();
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = (present, total) => {
    if (total === 0) return 0;
    return ((present / total) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Attendance</h1>
        <p>Detailed subject-wise attendance records.</p>
      </div>
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ width: 'auto' }}>
            &larr; Back to Dashboard
          </button>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(course => (
                <tr key={course.courseId}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.totalClasses}</td>
                  <td>{course.presentCount}</td>
                  <td>{course.absentCount}</td>
                  <td>
                    <span
                      style={{
                        color: calculateAttendancePercentage(course.presentCount, course.totalClasses) < 75 ? 'red' : 'green',
                        fontWeight: 'bold'
                      }}
                    >
                      {calculateAttendancePercentage(course.presentCount, course.totalClasses)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;