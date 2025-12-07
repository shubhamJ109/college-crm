import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const HODDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📚 Head of Department Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, Prof. {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* HOD Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>HOD - {user?.hodInfo?.department || user?.requestedDepartment || 'Department'}</h2>
          <p style={{ fontSize: '16px' }}><strong>HOD ID:</strong> {user?.userId}</p>
          <p style={{ fontSize: '16px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ fontSize: '16px' }}><strong>Phone:</strong> {user?.phone}</p>
          <p style={{ fontSize: '16px' }}><strong>Department:</strong> {user?.hodInfo?.department || user?.requestedDepartment || 'Not Assigned'}</p>
          {user?.hodInfo?.employeeId && (
            <p style={{ fontSize: '16px' }}><strong>Employee ID:</strong> {user.hodInfo.employeeId}</p>
          )}
          {user?.hodInfo?.appointmentDate && (
            <p style={{ fontSize: '16px' }}><strong>Appointed:</strong> {new Date(user.hodInfo.appointmentDate).toLocaleDateString()}</p>
          )}
        </div>

        {/* Department Stats */}
        <h3 style={{ marginBottom: '15px' }}>Department Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Students</p>
          </div>
          <div style={{ background: '#ddd6fe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#7c3aed', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Faculty Members</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>
              {user?.hodInfo?.selectedCourses?.length || 0}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Selected Courses</p>
          </div>
          <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#16a34a', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Pending Approvals</p>
          </div>
        </div>

        {/* Management Options */}
        <h3 style={{ marginBottom: '15px' }}>Department Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👥 Faculty Management</h3>
            <p style={{ color: '#666' }}>Manage faculty members and assignments</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/dashboard/hod/faculty')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Manage Faculty
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 Course Management</h3>
            <p style={{ color: '#666' }}>Approve and manage department courses</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/dashboard/hod/courses')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Manage Courses
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👨‍🎓 Students Management</h3>
            <p style={{ color: '#666' }}>View and manage department students</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/dashboard/faculty/students')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              View Students
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📊 Department Reports</h3>
            <p style={{ color: '#666' }}>Generate academic performance reports</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Reports</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📅 Timetable</h3>
            <p style={{ color: '#666' }}>Manage department timetable</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Timetable</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🎓 Examination</h3>
            <p style={{ color: '#666' }}>Exam scheduling and management</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Exams</button>
          </div>
        </div>

        {/* Pending Actions */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
          <h3>⚠️ Pending Actions</h3>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>0 enrollment requests awaiting approval</li>
            <li>0 course proposals pending review</li>
            <li>0 faculty leave requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
