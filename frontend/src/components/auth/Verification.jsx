import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { getMe } from '../../services/api';

const Verification = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const initialStage = useMemo(() => {
    if (state?.stage === 'awaiting_employee_id_input') return 'verified';
    return 'pending';
  }, [state]);

  const [profile, setProfile] = useState({
    name: state?.user?.name || 'User',
    role: state?.user?.role || 'faculty',
    designation: state?.user?.designation || '',
    department: state?.user?.department || '',
    userId: state?.user?.userId || ''
  });

  // UI stage: 'pending' (yellow) until admin sends email, then 'verified' (green with input)
  const [stage, setStage] = useState(initialStage);
  const [employeeId, setEmployeeId] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('holdToken') || localStorage.getItem('token') || '');

  const dashboardRoutes = {
    student: '/dashboard/student',
    faculty: '/dashboard/faculty',
    admin: '/dashboard/admin',
    super_admin: '/dashboard/admin',
    principal: '/dashboard/admin',
    hod: '/dashboard/hod',
    parent: '/dashboard/parent',
    accountant: '/dashboard/accountant',
    librarian: '/dashboard/librarian',
    placement_officer: '/dashboard/placement',
    academic_dean: '/dashboard/academic-dean'
  };

  const goToDashboard = (role) => {
    const path = dashboardRoutes[role] || '/dashboard';
    navigate(path, { replace: true });
  };

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  useEffect(() => {
    const syncToken = () => {
      const token = localStorage.getItem('holdToken') || localStorage.getItem('token') || '';
      setAuthToken(token);
      if (!token) {
        setSessionExpired(true);
      }
    };
    const onStorage = (e) => {
      if (e.key === 'holdToken' || e.key === 'token') {
        syncToken();
      }
    };
    window.addEventListener('storage', onStorage);
    syncToken();
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const buildAuthHeaders = () => {
    const token = localStorage.getItem('holdToken') || localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  // Poll every 5s to check: (1) admin approved, (2) email sent, (3) already verified
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const headers = buildAuthHeaders();
      if (!headers) {
        setSessionExpired(true);
        return;
      }
      try {
        const me = await getMe({ headers });
        const u = me.data.data;
        if (!u) return;

        setProfile({
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          designation: u.facultyInfo?.designation || '',
          department:
            u.facultyInfo?.department ||
            u.hodInfo?.department ||
            u.studentInfo?.department ||
            '',
          userId: u.userId
        });

        if (!u.isApproved) {
          setStage('pending');
        } else if (u.employeeIdVerified) {
          goToDashboard(u.role);
          return;
        } else if (u.employeeIdEmailSentAt) {
          setStage('verified');
        } else {
          setStage('pending');
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setSessionExpired(true);
          setError('Session expired. Please log in again to continue verification.');
          localStorage.removeItem('holdToken');
          stop = true;
          return;
        }
        console.error('Verification poll failed:', e);
      }
      if (!stop) setTimeout(tick, 5000);
    };

    tick();
    return () => { stop = true; };
  }, [navigate]);

  const submitEmployeeId = async (e) => {
    e.preventDefault();
    if (sessionExpired) return;
    setMsg('');
    setError('');
    const headers = buildAuthHeaders();
    if (!headers) {
      setSessionExpired(true);
      return;
    }
    try {
      const res = await api.post('/users/access/verify-employee-id', { employeeId }, { headers });

      // If server returned a full auth token, persist it and refresh profile
      const token = res.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.removeItem('holdToken');
        try {
          const me = await getMe({ headers: { Authorization: `Bearer ${token}` } });
          if (me?.data?.data) {
            localStorage.setItem('user', JSON.stringify(me.data.data));
          }
        } catch (e) {
          // ignore profile refresh errors; token is stored
        }
      }

      setMsg(res.data.message || 'Verified');
      setTimeout(() => goToDashboard(profile.role), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const isPending = stage === 'pending';
  const isVerified = stage === 'verified';
  const showVerifiedForm = isVerified && !sessionExpired;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ fontSize:36 }}>👋</div>
          <h2 style={{ margin:0 }}>Welcome, {profile.name}</h2>
        </div>

        <p style={{ marginTop:0, color:'#666' }}>
          {profile.designation ? `${profile.designation} • ` : ''}{profile.department || ''} • {profile.role?.replace('_',' ')}
        </p>

        {isPending && (
          <div style={{ border:'1px solid #fde68a', background:'#fffbeb', color:'#92400e', borderRadius:12, padding:16 }}>
            <strong>Awaiting admin verification</strong>
            <p style={{ margin:'8px 0 0' }}>
              Pending <span style={{ color:'#d97706', fontWeight:700 }}>●</span>
            </p>
            <p style={{ marginTop:10, fontSize:13, color:'#6b7280' }}>
              Note: After verification, an email with your Employee ID will be sent to your registered email.
            </p>
          </div>
        )}

        {showVerifiedForm && (
          <div style={{ border:'1px solid #bbf7d0', background:'#ecfdf5', color:'#065f46', borderRadius:12, padding:16 }}>
            <strong>Verified</strong>
            <p style={{ margin:'8px 0 16px' }}>
              An email containing your {profile.role === 'student' ? 'Student ID' : 'Employee ID'} has been sent. Enter it below to unlock your dashboard.
            </p>
            <form onSubmit={submitEmployeeId}>
              <div className="form-group">
                <label>Enter {profile.role === 'student' ? 'Student' : 'Employee'} ID</label>
                <input className="form-control" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required placeholder={profile.role === 'student' ? 'Student ID' : 'Employee ID'} />
              </div>
              <button className="btn-primary" style={{ width:'auto', padding:'8px 18px' }}>Verify & Continue</button>
            </form>
            {msg && <p style={{ marginTop:10 }}>{msg}</p>}
            {error && <p style={{ marginTop:10, color:'#dc2626' }}>{error}</p>}
          </div>
        )}

        {sessionExpired && (
          <div style={{ marginTop:16, border:'1px solid #fecaca', background:'#fef2f2', color:'#b91c1c', borderRadius:12, padding:16 }}>
            <strong>Session Ended</strong>
            <p style={{ margin:'8px 0 12px' }}>{error || 'Your verification session has ended.'}</p>
            <button className="btn-primary" onClick={() => navigate('/login', { replace: true })} style={{ width:'auto', padding:'8px 16px', background:'#b91c1c' }}>
              Login Again
            </button>
          </div>
        )}

        {!showVerifiedForm && !isPending && !sessionExpired && error && <p style={{ marginTop:16, color:'#dc2626' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Verification;
