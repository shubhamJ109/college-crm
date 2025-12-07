import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AccountantDashboard = () => {
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
          <h1>💰 Accountant Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Accountant Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: '16px' }}><strong>Employee ID:</strong> {user?.accountantInfo?.employeeId}</p>
          <p style={{ fontSize: '16px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ fontSize: '16px' }}><strong>Department:</strong> {user?.accountantInfo?.department || 'Finance'}</p>
        </div>

        {/* Financial Stats */}
        <h3 style={{ marginBottom: '15px' }}>Financial Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#16a34a', fontSize: '32px', margin: '10px 0' }}>₹0</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Collection</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', fontSize: '32px', margin: '10px 0' }}>₹0</h3>
            <p style={{ color: '#666', margin: 0 }}>Pending Fees</p>
          </div>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2563eb', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Paid Students</p>
          </div>
          <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '32px', margin: '10px 0' }}>0</h3>
            <p style={{ color: '#666', margin: 0 }}>Defaulters</p>
          </div>
        </div>

        {/* Fee Management Options */}
        <h3 style={{ marginBottom: '15px' }}>Fee Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>💳 Collect Fees</h3>
            <p style={{ color: '#666' }}>Record fee payments from students</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Collect Fees</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📋 Fee Records</h3>
            <p style={{ color: '#666' }}>View all fee payment records</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Records</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>⚠️ Pending Fees</h3>
            <p style={{ color: '#666' }}>Track students with pending fees</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>View Pending</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📊 Financial Reports</h3>
            <p style={{ color: '#666' }}>Generate financial reports</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Generate Report</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>🔔 Send Reminders</h3>
            <p style={{ color: '#666' }}>Send fee payment reminders</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Send Reminders</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3>📑 Receipts</h3>
            <p style={{ color: '#666' }}>Generate and print receipts</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: '10px' }}>Manage Receipts</button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3>💸 Recent Transactions</h3>
          <p style={{ color: '#666' }}>No recent transactions to display</p>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
