import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await api.get('/work-assignments/my-assignments');
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
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
          <h1>👨‍🏫 Faculty Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.facultyInfo?.designation} {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Total Courses */}
          <div style={{
            background: '#dbeafe',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>
              {assignments.reduce((total, work) => total + (work.courses?.length || 0), 0)}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>📚 Total Courses</p>
          </div>

          {/* Total Divisions */}
          <div style={{
            background: '#fef3c7',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>
              {[...new Set(assignments.flatMap(work => work.divisions || []))].length}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>📍 Total Divisions</p>
          </div>

          {/* Total Students */}
          <div style={{
            background: '#ddd6fe',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#7c3aed', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>👥 Total Students</p>
          </div>

          {/* Pending Approvals */}
          <div style={{
            background: '#dcfce7',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#16a34a', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>⏳ Pending Approvals</p>
          </div>
        </div>

        {/* Profile Section */}
        <div style={{ background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p><strong>Employee ID:</strong> {user?.facultyInfo?.employeeId}</p>
          <p><strong>Department:</strong> {user?.facultyInfo?.department || user?.requestedDepartment}</p>
          <p><strong>Designation:</strong> {user?.facultyInfo?.designation}</p>
          <p><strong>Qualification:</strong> {user?.facultyInfo?.qualification}</p>
          <p><strong>Experience:</strong> {user?.facultyInfo?.experience} years</p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>✅ Mark Attendance</h3>
            <p style={{ color: '#666' }}>Mark attendance for your classes</p>
            <button 
              onClick={() => navigate('/dashboard/faculty/attendance')}
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Mark Attendance
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📝 Enter Grades</h3>
            <p style={{ color: '#666' }}>Enter exam marks and grades</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Enter Grades</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 My Courses</h3>
            <p style={{ color: '#666' }}>View and manage your courses</p>
            <button 
              onClick={() => navigate('/dashboard/faculty/courses')}
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              View Courses
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📦 Assignments</h3>
            <p style={{ color: '#666' }}>View all division/course assignments</p>
            <button 
              onClick={() => navigate('/dashboard/faculty/assignments')}
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              View Assignments
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👥 Students</h3>
            <p style={{ color: '#666' }}>View student list and records</p>
            <button 
              onClick={() => navigate('/dashboard/faculty/students')}
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              View Students
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📊 Reports</h3>
            <p style={{ color: '#666' }}>Generate performance reports</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
