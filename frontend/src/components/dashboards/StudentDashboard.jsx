import { useEffect, useState } from 'react';
import { getMe, getStudentAttendance } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    totalPresent: 0,
    percentage: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getMe();
        setUser(userResponse.data.data);
        await fetchAttendanceData();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const fetchAttendanceData = async () => {
    try {
      const response = await getStudentAttendance();
      const attendanceData = response.data.data;
      
      let totalClasses = 0;
      let totalPresent = 0;

      attendanceData.forEach(course => {
        totalClasses += course.totalClasses;
        totalPresent += course.presentCount;
      });

      const percentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

      setAttendanceStats({ totalClasses, totalPresent, percentage });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🎓 Student Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome back, {user?.firstName}!</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        {/* Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>WELCOME, {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}</h2>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>{user?.studentInfo?.department}</strong>, [{user?.studentInfo?.classYear}], Division: {user?.studentInfo?.division}
          </p>
          <p style={{ fontSize: '16px' }}>
            <strong>ROLL NO:</strong> {user?.userId} | <strong>Semester:</strong> {user?.studentInfo?.semester}
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#667eea', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Enrolled Courses</p>
          </div>
          <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#10b981', fontSize: '32px', margin: '10px 0' }}>{attendanceStats.percentage}%</h3>
            <p style={{ color: '#666', margin: 0 }}>Attendance</p>
          </div>
          <div style={{ background: '#fefce8', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Pending Assignments</p>
          </div>
          <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#ef4444', fontSize: '32px', margin: '10px 0' }}>-</h3>
            <p style={{ color: '#666', margin: 0 }}>CGPA</p>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 My Courses</h3>
            <p style={{ color: '#666' }}>View enrolled courses and course materials</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Courses</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>✅ Attendance</h3>
            <p style={{ color: '#666' }}>Check your attendance records</p>
            <button onClick={() => navigate('/student/attendance')} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Attendance</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📝 Assignments</h3>
            <p style={{ color: '#666' }}>Submit and track assignments</p>
            <button onClick={() => navigate('/student/assignments')} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Assignments</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🎯 Grades</h3>
            <p style={{ color: '#666' }}>View your exam results and grades</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Grades</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>💰 Fees</h3>
            <p style={{ color: '#666' }}>Check fee status and payment history</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Fees</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📖 Library</h3>
            <p style={{ color: '#666' }}>Search books and check issued books</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Go to Library</button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3>Recent Activity</h3>
          <p style={{ color: '#666' }}>No recent activity to show</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
