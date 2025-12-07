import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
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
          <h1>👨‍👩‍👧 Parent Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Parent Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: '16px' }}><strong>Parent ID:</strong> {user?.userId}</p>
          <p style={{ fontSize: '16px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ fontSize: '16px' }}><strong>Phone:</strong> {user?.phone}</p>
          {user?.parentInfo?.occupation && (
            <p style={{ fontSize: '16px' }}><strong>Occupation:</strong> {user?.parentInfo?.occupation}</p>
          )}
        </div>

        {/* Children Section */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <h3>👦 My Children</h3>
          {user?.parentInfo?.children?.length > 0 ? (
            <div style={{ marginTop: '15px' }}>
              {user.parentInfo.children.map((child, index) => (
                <div key={index} style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', marginBottom: '10px' }}>
                  <p><strong>Student ID:</strong> {child.studentId || 'Not linked yet'}</p>
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>
                    View Full Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginTop: '10px' }}>No children linked to your account yet. Please contact admin to link student accounts.</p>
          )}
        </div>

        {/* Quick Actions */}
        <h3 style={{ marginBottom: '15px' }}>Student Information & Tracking</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>✅ Attendance</h3>
            <p style={{ color: '#666' }}>View your child's attendance records</p>
            <div style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>Overall: 0%</p>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Details</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🎯 Academic Performance</h3>
            <p style={{ color: '#666' }}>Check grades and exam results</p>
            <div style={{ marginTop: '10px', padding: '10px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#d97706', fontWeight: 'bold' }}>CGPA: -</p>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Grades</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📝 Assignments</h3>
            <p style={{ color: '#666' }}>Track assignment submissions</p>
            <div style={{ marginTop: '10px', padding: '10px', background: '#dbeafe', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#2563eb', fontWeight: 'bold' }}>Pending: 0</p>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Assignments</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>💰 Fee Status</h3>
            <p style={{ color: '#666' }}>Check fee payment status</p>
            <div style={{ marginTop: '10px', padding: '10px', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>Status: Paid</p>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Details</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 Course Details</h3>
            <p style={{ color: '#666' }}>View enrolled courses and schedule</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Courses</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📞 Contact Faculty</h3>
            <p style={{ color: '#666' }}>Send messages to teachers</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Send Message</button>
          </div>
        </div>

        {/* Recent Updates */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3>📢 Recent Updates</h3>
          <p style={{ color: '#666' }}>No recent updates available</p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
