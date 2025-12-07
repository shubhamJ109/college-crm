import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AcademicDeanDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch (e) {
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1>🎓 Academic Dean Dashboard</h1>
          <p style={{ margin:0, color:'#666' }}>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        <button className="btn-primary" style={{ width:'auto', padding:'10px 20px' }} onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Profile */}
        <div style={{ background:'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', color:'#fff', padding:30, borderRadius:12, marginBottom:20 }}>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p><strong>User ID:</strong> {user?.userId}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Employee ID:</strong> {user?.academicDeanInfo?.employeeId}</p>
          {user?.academicDeanInfo?.office && <p><strong>Office:</strong> {user.academicDeanInfo.office}</p>}
        </div>

        {/* Quick KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20, marginBottom:20 }}>
          <Card color="#2563eb" bg="#dbeafe" value="0" label="Departments" />
          <Card color="#0ea5e9" bg="#cffafe" value="0" label="Active Curriculums" />
          <Card color="#f59e0b" bg="#fef3c7" value="0" label="Pending Approvals" />
          <Card color="#10b981" bg="#dcfce7" value="0" label="Published Calendars" />
        </div>

        {/* Actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          <Panel title="📅 Academic Calendar" desc="Create and publish institute academic calendars">
            <button className="btn-primary" style={{ width:'auto', padding:'8px 16px' }}>Manage Calendar</button>
          </Panel>

          <Panel title="📚 Curriculum Registry" desc="Approve and update department curriculums">
            <button className="btn-primary" style={{ width:'auto', padding:'8px 16px' }}>View Curriculums</button>
          </Panel>

          <Panel title="📝 Course Policies" desc="Define policies like credits, attendance, grading scheme">
            <button className="btn-primary" style={{ width:'auto', padding:'8px 16px' }}>Manage Policies</button>
          </Panel>

          <Panel title="🎯 Academic Reports" desc="Generate academic performance insights">
            <button className="btn-primary" style={{ width:'auto', padding:'8px 16px' }}>View Reports</button>
          </Panel>

          <Panel title="🤝 Coordination" desc="Coordinate across HODs and Faculty">
            <button className="btn-primary" style={{ width:'auto', padding:'8px 16px' }}>Open Console</button>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Card = ({ color, bg, value, label }) => (
  <div style={{ background:bg, padding:20, borderRadius:12, textAlign:'center' }}>
    <h3 style={{ color, fontSize:32, margin:'10px 0' }}>{value}</h3>
    <p style={{ color:'#666', margin:0 }}>{label}</p>
  </div>
);

const Panel = ({ title, desc, children }) => (
  <div style={{ background:'#fff', padding:20, border:'1px solid #e5e7eb', borderRadius:12 }}>
    <h3>{title}</h3>
    <p style={{ color:'#666' }}>{desc}</p>
    {children}
  </div>
);

export default AcademicDeanDashboard;



