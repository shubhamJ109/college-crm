import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const LibrarianDashboard = () => {
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
          <h1>📖 Librarian Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Librarian Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: '16px' }}><strong>Employee ID:</strong> {user?.librarianInfo?.employeeId}</p>
          <p style={{ fontSize: '16px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ fontSize: '16px' }}><strong>Library ID:</strong> {user?.userId}</p>
        </div>

        {/* Library Stats */}
        <h3 style={{ marginBottom: '15px' }}>Library Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Books</p>
          </div>
          <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#16a34a', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Available Books</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Issued Books</p>
          </div>
          <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Overdue Returns</p>
          </div>
        </div>

        {/* Library Management Options */}
        <h3 style={{ marginBottom: '15px' }}>Library Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📚 Book Catalog</h3>
            <p style={{ color: '#666' }}>Manage library book inventory</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Books</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>✅ Issue Books</h3>
            <p style={{ color: '#666' }}>Issue books to students/faculty</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Issue Book</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🔄 Return Books</h3>
            <p style={{ color: '#666' }}>Process book returns</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Return Book</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📋 Issued Books Log</h3>
            <p style={{ color: '#666' }}>View all issued books records</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Log</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>⚠️ Overdue Books</h3>
            <p style={{ color: '#666' }}>Track overdue book returns</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Overdue</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🔍 Search Books</h3>
            <p style={{ color: '#666' }}>Search library database</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Search</button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3>📜 Recent Activity</h3>
          <p style={{ color: '#666' }}>No recent library transactions</p>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
