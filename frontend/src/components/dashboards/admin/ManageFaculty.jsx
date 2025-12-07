import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const departments = ['CSE','ECE','MECH','CIVIL','IT','EEE'];


const genEmpIdFrom = (f) => {
  // Example pattern: FAC-<DEPT>-<YEAR>-<4digit> or HOD-<DEPT>-<YEAR>-<4digit>
  // Use HOD- prefix for HOD role to isolate from faculty
  const prefix = f.role === 'hod' ? 'HOD' : 'FAC';
  const dept = (f.requestedDepartment || f.facultyInfo?.department || f.hodInfo?.department || 'GEN').toUpperCase();
  const year = new Date().getFullYear();
  // derive a 4-digit sequence from userId tail to keep client-only logic simple
  const seq = (f.userId || '').replace(/\D/g, '').slice(-4).padStart(4, '0') || '0001';
  return `${prefix}-${dept}-${year}-${seq}`;
};

const KebabMenu = ({ onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <button className="btn-primary" onClick={() => setOpen(o => !o)} style={{ width:'32px', height:'32px', padding:0, borderRadius:8, background:'#6b7280' }}>
        ⋯
      </button>
      {open && (
        <div style={{
          position:'absolute', right:0, top:'36px', background:'#fff', border:'1px solid #e5e7eb',
          borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.08)', minWidth:140, zIndex:10
        }}>
          <button onClick={() => { setOpen(false); onDelete(); }} style={{
            display:'block', width:'100%', textAlign:'left', padding:'8px 12px', background:'transparent', border:'none', color:'#ef4444'
          }}>
            Delete Faculty
          </button>
        </div>
      )}
    </div>
  );
};

const ManageFaculty = () => {
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState([]);
  const [filter, setFilter] = useState({ department: '', status: '', search: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Access Control panel toggle
  const [showAccess, setShowAccess] = useState(false);
  // Access requests state
  const [reqLoading, setReqLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [newEmployeeId, setNewEmployeeId] = useState({}); // keyed by userId
  const [confirmed, setConfirmed] = useState({}); // track confirm status per user

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filter.department) params.department = filter.department;
    if (filter.status) params.status = filter.status;
    if (filter.search) params.search = filter.search;

    // Adjust to your actual endpoint
    const res = await api.get('/users/role/faculty', { params });
    setFaculty(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  // load access requests when access panel opens
  useEffect(() => { if (showAccess) loadRequests(); }, [showAccess]);

  const filtered = useMemo(() => {
    if (!filter.search) return faculty;
    const q = filter.search.toLowerCase();
    return faculty.filter(f =>
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.userId || '').toLowerCase().includes(q)
    );
  }, [faculty, filter.search]);

  const approve = async (id) => {
    await api.put(`/users/access/approve/${id}`);
    await load();
  };

  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const res = await api.get('/users/access/requests', { params: { role: 'faculty' } });
      const data = res.data.data || [];
      setRequests(data);
      // seed UI state from server flags
      const c = {};
      const ids = {};
      data.forEach(r => {
        c[r._id] = !!r.isApproved;
        ids[r._id] = r.employeeIdIssued || ids[r._id] || '';
      });
      setConfirmed(c);
      setNewEmployeeId(ids);
    } catch (err) {
      setRequests([]);
    }
    setReqLoading(false);
  };

  const confirm = async (id) => {
    await api.put(`/users/access/confirm/${id}`);
    setConfirmed(prev => ({ ...prev, [id]: true }));
  };

  // Generate on client, show it in input
  const onGenerateId = async (r) => {
    const generated = genEmpIdFrom(r);
    // optimistic fill in input
    setNewEmployeeId(prev => ({ ...prev, [r._id]: generated }));
  };

  // Persist issued employee ID to backend
  const saveIssuedId = async (id) => {
    const val = (newEmployeeId[id] || '').trim();
    if (!val) return alert('Generate/enter an Employee ID first');
    await api.put(`/users/access/issue-id/${id}`, { employeeId: val });
    // no reload needed; keep local state
    alert('Employee ID saved');
  };

  // Send email with issued ID (new version)
  const sendEmail = async (id) => {
    await api.post(`/users/access/send-id-email/${id}`);
    alert('Employee ID email sent');
  };

  // Delete faculty
  const deleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    // refresh both requests and faculty list
    await loadRequests();
    await load(); // load() is your existing list loader
  };

  const setStatus = async (id, status) => {
    await api.put(`/users/${id}`, { status });
    await load();
  };

  const startEdit = (f) => {
    setEditing({
      _id: f._id,
      phone: f.phone || '',
      designation: f.facultyInfo?.designation || '',
      experience: f.facultyInfo?.experience || 0,
      department: f.facultyInfo?.department || ''
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    const body = {
      phone: editing.phone,
      facultyInfo: {
        designation: editing.designation,
        experience: Number(editing.experience),
        department: editing.department
      }
    };
    await api.put(`/users/${editing._id}`, body);
    setSaving(false);
    setEditing(null);
    await load();
  };

  return (
    <div className="dashboard-content" style={{ position: 'relative' }}>
      {/* Header with Access Control button (top-left) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          className="btn-primary"
          onClick={() => setShowAccess(s => !s)}
          style={{ width: 'auto', padding: '8px 14px' }}
        >
          {showAccess ? 'Close Access Control' : 'Access Control'}
        </button>
        <h2 style={{ margin: 0 }}>Manage Faculty</h2>
      </div>

      {/* Smooth Access Control card (placeholder content for now) */}
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 300ms ease, opacity 250ms ease, transform 300ms ease',
          maxHeight: showAccess ? 500 : 0,
          opacity: showAccess ? 1 : 0,
          transform: showAccess ? 'translateY(0px)' : 'translateY(-6px)'
        }}
      >
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            background: '#ffffff',
            padding: 16,
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 20 }}>🔐</div>
            <h3 style={{ margin: 0 }}>Access Control</h3>
          </div>
          <p style={{ color: '#666', marginTop: 0 }}>
            Approve or review pending faculty requests here (hook this to your requests API later).
          </p>
          {reqLoading ? <p>Loading...</p> : (
            <div style={{ display:'grid', gap: 10 }}>
              {requests.map(r => (
                <div key={r._id}
                  style={{ display:'grid', gridTemplateColumns:'2fr auto 1.3fr auto', gap: 8, alignItems:'center',
                           padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius: 10 }}>
                  {/* left: identity */}
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                    <div style={{ color:'#666', fontSize: 13 }}>
                      {(r.requestedDepartment || r.facultyInfo?.department || '-')} • {(r.facultyInfo?.designation || '-')} • {r.userId}
                    </div>
                  </div>

                  {/* status */}
                  <div style={{ color: confirmed[r._id] ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {confirmed[r._id] ? 'Approved' : 'Pending'}
                  </div>

                  {/* Employee ID input */}
                  <div style={{ display:'flex', gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder="Employee ID"
                      value={newEmployeeId[r._id] || ''}
                      onChange={e => setNewEmployeeId(prev => ({ ...prev, [r._id]: e.target.value }))}
                    />
                  </div>

                  {/* actions: Generate / Confirm / Save ID / Send Email */}
                  <div style={{ display:'flex', gap: 6, justifyContent:'flex-end', flexWrap:'wrap' }}>
                    <button className="btn-primary" onClick={() => onGenerateId(r)} style={{ width:'auto', padding:'6px 10px', background:'#374151' }}>
                      Generate ID
                    </button>

                    {!confirmed[r._id] && (
                    <button className="btn-primary" onClick={() => confirm(r._id)} style={{ width:'auto', padding:'6px 10px' }}>
                        Confirm
                      </button>
                    )}

                    <button className="btn-primary" onClick={() => saveIssuedId(r._id)} style={{ width:'auto', padding:'6px 10px', background:'#4b5563' }}>
                      Save ID
                    </button>

                    {confirmed[r._id] && (
                      <button className="btn-primary" onClick={() => sendEmail(r._id)} style={{ width:'auto', padding:'6px 10px', background:'#0ea5e9' }}>
                        Send Email
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p style={{ color:'#666' }}>No pending/awaiting verification requests.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 10, margin: '10px 0 20px' }}>
        <select className="form-control" value={filter.department} onChange={e => setFilter({ ...filter, department: e.target.value })}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="form-control" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Any Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>

        <input
          className="form-control"
          placeholder="Search name, email, or User ID"
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
        />

        <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={load}>Apply</button>
      </div>

      {/* List */}
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(f => (
            <div key={f._id} style={{ background:'#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{f.firstName} {f.lastName}</h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    {f.userId} • {f.email} • {f.status}
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>
                    Dept: {f.facultyInfo?.department || '-'} • Designation: {f.facultyInfo?.designation || '-'} • Exp: {f.facultyInfo?.experience ?? '-'} yrs
                  </p>
                </div>
                <KebabMenu onDelete={() => deleteFaculty(f._id)} />
              </div>

              <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap', marginTop: 12 }}>
                {!f.isApproved && (
                  <button className="btn-primary" onClick={() => approve(f._id)} style={{ width: 'auto', padding:'8px 12px' }}>
                    Approve
                  </button>
                )}

                {f.status !== 'Active' && (
                  <button className="btn-primary" onClick={() => setStatus(f._id, 'Active')} style={{ width: 'auto', padding:'8px 12px' }}>
                    Activate
                  </button>
                )}

                {f.status === 'Active' && (
                  <button className="btn-primary" onClick={() => setStatus(f._id, 'Inactive')} style={{ width: 'auto', padding:'8px 12px', background:'#ef4444' }}>
                    Deactivate
                  </button>
                )}

                <button className="btn-primary" onClick={() => startEdit(f)} style={{ width: 'auto', padding:'8px 12px', background:'#6b7280' }}>
                  Edit
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p style={{ color:'#666' }}>No faculty found.</p>}
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <div style={{ marginTop: 20, background:'#fff', border:'1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h3>Edit Faculty</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <select className="form-control" value={editing.designation} onChange={e => setEditing({ ...editing, designation: e.target.value })}>
                <option value="">Select</option>
                <option>Professor</option>
                <option>Associate Professor</option>
                <option>Assistant Professor</option>
                <option>Lecturer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input type="number" className="form-control" value={editing.experience} onChange={e => setEditing({ ...editing, experience: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-control" value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'flex', gap: 10, marginTop: 12 }}>
            <button className="btn-primary" onClick={saveEdit} disabled={saving} style={{ width:'auto', padding:'8px 16px' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn-primary" onClick={() => setEditing(null)} style={{ width:'auto', padding:'8px 16px', background:'#6b7280' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaculty;
