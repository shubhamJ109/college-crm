import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api, { getMe } from '../../services/api';

const AccessHold = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initial = state?.user || {};
  const [stage, setStage] = useState(state?.stage || 'awaiting_admin_approval');
  const [user, setUser] = useState(initial);
  const [employeeId, setEmployeeId] = useState('');
  const [msg, setMsg] = useState('');

  // Poll user status every 6s to see if admin approved and/or emailed
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const me = await getMe();
        const u = me.data.data;
        if (!u) return;
        // Mirror backend gates
        if (!u.isApproved) {
          setStage('awaiting_admin_approval');
        } else if (!u.employeeIdVerified) {
          setStage('awaiting_employee_id_input');
        } else {
          navigate(`/dashboard/faculty`); // or role-based map
        }
        setUser({
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          department: u.facultyInfo?.department || u.hodInfo?.department || '',
          designation: u.facultyInfo?.designation || '',
          userId: u.userId
        });
      } catch (e) {}
    }, 6000);
    return () => clearInterval(timer);
  }, [navigate]);

  const submitEmployeeId = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/users/access/verify-employee-id', { employeeId });
      setMsg(res.data.message);
      // load me; navigate will happen in poll or you can navigate directly
    } catch (err) {
      setMsg(err.response?.data?.message || 'Verification failed');
    }
  };

  const isPending = stage === 'awaiting_admin_approval';
  const isIdNeeded = stage === 'awaiting_employee_id_input';

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 36 }}>👋</div>
          <h2 style={{ margin: 0 }}>Welcome, {user?.name || initial?.name || 'User'}</h2>
        </div>

        <p style={{ marginTop: 0, color: '#666' }}>
          {user?.designation ? `${user.designation} • ` : ''}{user?.department || ''} • {user?.role?.replace('_',' ')}
        </p>

        {isPending && (
          <div style={{
            border: '1px solid #fde68a',
            background: '#fffbeb',
            color: '#92400e',
            borderRadius: 12,
            padding: 16
          }}>
            <strong>Admin verification pending</strong>
            <p style={{ margin: '8px 0 0' }}>
              Your account will be approved by Admin. This page will auto-refresh every few seconds.
            </p>
          </div>
        )}

        {isIdNeeded && (
          <div style={{
            border: '1px solid #bbf7d0',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: 12,
            padding: 16
          }}>
            <strong>Verification approved</strong>
            <p style={{ margin: '8px 0 16px' }}>
              An email with your Employee ID has been sent to your registered email. Enter it below to unlock your dashboard.
            </p>

            <form onSubmit={submitEmployeeId}>
              <div className="form-group">
                <label>Employee ID</label>
                <input className="form-control" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 18px' }}>
                Verify & Continue
              </button>
            </form>

            {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
          </div>
        )}

        <div className="text-center mt-3">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AccessHold;
