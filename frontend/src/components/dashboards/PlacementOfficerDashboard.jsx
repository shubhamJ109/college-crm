import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PlacementOfficerDashboard = () => {
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
          <h1>💼 Placement Officer Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Placement Officer Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', padding: '30px', borderRadius: '12px', color: '#333', marginBottom: '20px' }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: '16px' }}><strong>Employee ID:</strong> {user?.placementInfo?.employeeId}</p>
          <p style={{ fontSize: '16px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ fontSize: '16px' }}><strong>Department:</strong> {user?.placementInfo?.department || 'Placement Cell'}</p>
        </div>

        {/* Placement Stats */}
        <h3 style={{ marginBottom: '15px' }}>Placement Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#16a34a', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Students Placed</p>
          </div>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Active Job Postings</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Registered Companies</p>
          </div>
          <div style={{ background: '#e0e7ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#6366f1', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Upcoming Drives</p>
          </div>
        </div>

        {/* Placement Management Options */}
        <h3 style={{ marginBottom: '15px' }}>Placement Activities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🏢 Company Management</h3>
            <p style={{ color: '#666' }}>Add and manage recruiting companies</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Companies</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📢 Job Postings</h3>
            <p style={{ color: '#666' }}>Create and manage job opportunities</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Post Job</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📅 Placement Drives</h3>
            <p style={{ color: '#666' }}>Schedule campus placement drives</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Schedule Drive</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>👨‍🎓 Student Database</h3>
            <p style={{ color: '#666' }}>View eligible students for placements</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Students</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>✅ Applications</h3>
            <p style={{ color: '#666' }}>Track student job applications</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Applications</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📊 Placement Reports</h3>
            <p style={{ color: '#666' }}>Generate placement statistics</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Generate Report</button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <h3>📆 Upcoming Placement Events</h3>
          <p style={{ color: '#666' }}>No upcoming placement drives scheduled</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementOfficerDashboard;
