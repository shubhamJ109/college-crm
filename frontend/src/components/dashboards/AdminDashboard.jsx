import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
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
          <h1>👔 Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Students</p>
          </div>
          <div style={{ background: '#ddd6fe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#7c3aed', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Faculty</p>
          </div>
          <div style={{ background: '#fce7f3', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#db2777', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Courses</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Departments</p>
          </div>
        </div>

        {/* Management Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👥 Manage Students</h3>
            <p style={{ color: '#666' }}>Add, edit, or remove students</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard/admin/students')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Manage Students
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👨‍🏫 Manage Faculty</h3>
            <p style={{ color: '#666' }}>Add, edit, or remove faculty members</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard/admin/faculty')} style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Faculty</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 Manage Courses</h3>
            <p style={{ color: '#666' }}>Create and manage courses</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard/admin/courses')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Manage Courses
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🏢 Departments</h3>
            <p style={{ color: '#666' }}>Manage departments and HODs</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard/admin/departments')}
              style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}
            >
              Manage Departments
            </button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📊 Reports</h3>
            <p style={{ color: '#666' }}>Generate system-wide reports</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Reports</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>⚙️ Settings</h3>
            <p style={{ color: '#666' }}>System configuration and settings</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Settings</button>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default AdminDashboard;
