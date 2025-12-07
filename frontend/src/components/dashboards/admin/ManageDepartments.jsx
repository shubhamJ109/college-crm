import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const genHodIdFrom = (h) => {
  const dept = (h.requestedDepartment || 'GEN').toUpperCase();
  const year = new Date().getFullYear();
  const seq = (h.userId || '').replace(/\D/g, '').slice(-4).padStart(4, '0') || '0001';
  return `HOD-${dept}-${year}-${seq}`;
};

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState({ name: '', code: '', building: '', description: '', hodUserId: '' });

  const [showAccess, setShowAccess] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [newEmployeeId, setNewEmployeeId] = useState({});
  const [confirmed, setConfirmed] = useState({});

  const [hodUsers, setHodUsers] = useState([]);
  const [hodLoading, setHodLoading] = useState(false);
  const [hodMenuOpen, setHodMenuOpen] = useState(null);

  const loadDepartments = async () => {
    setLoading(true);
    const res = await api.get('/departments');
    setDepartments(res.data.data || []);
    setLoading(false);
  };

  const loadHodUsers = async () => {
    setHodLoading(true);
    try {
      const res = await api.get('/users/role/hod');
      setHodUsers(res.data.data || []);
    } catch (err) {
      setHodUsers([]);
    }
    setHodLoading(false);
  };

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => { if (showAccess) loadRequests(); }, [showAccess]);
  useEffect(() => { loadHodUsers(); }, []);

  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const res = await api.get('/users/access/requests', { params: { role: 'hod' } });
      const data = res.data.data || [];
      setRequests(data);
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

  const filtered = useMemo(() => {
    if (!filter.search) return departments;
    const q = filter.search.toLowerCase();
    return departments.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.hod?.name || '').toLowerCase().includes(q)
    );
  }, [departments, filter.search]);

  const confirm = async (id) => {
    await api.put(`/users/access/confirm/${id}`);
    setConfirmed(prev => ({ ...prev, [id]: true }));
  };

  const approve = async (id) => {
    await api.put(`/users/access/approve/${id}`);
    await loadRequests();
  };

  const onGenerateId = (h) => {
    const generated = genHodIdFrom(h);
    setNewEmployeeId(prev => ({ ...prev, [h._id]: generated }));
  };

  const saveIssuedId = async (id) => {
    const val = (newEmployeeId[id] || '').trim();
    if (!val) return alert('Generate/enter an Employee ID first');
    await api.put(`/users/access/issue-id/${id}`, { employeeId: val });
    alert('Employee ID saved');
  };

  const sendEmail = async (id) => {
    await api.post(`/users/access/send-id-email/${id}`);
    alert('Employee ID email sent');
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return;
    await api.delete(`/departments/${id}`);
    await loadDepartments();
  };

  const startEdit = (dept) => {
    setEditing({
      _id: dept._id,
      name: dept.name,
      code: dept.code,
      building: dept.building || '',
      description: dept.description || '',
      hodUserId: dept.hod?.userId || ''
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    const body = {
      name: editing.name,
      code: editing.code,
      building: editing.building,
      description: editing.description,
      hodUserId: editing.hodUserId
    };
    await api.put(`/departments/${editing._id}`, body);
    setSaving(false);
    setEditing(null);
    await loadDepartments();
  };

  const createDepartment = async () => {
    if (!creating.name || !creating.code) {
      return alert('Name and code are required');
    }
    await api.post('/departments', creating);
    setCreating({ name: '', code: '', building: '', description: '', hodUserId: '' });
    await loadDepartments();
  };

  const deleteHod = async (hodId) => {
    if (!window.confirm('Delete this HOD? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${hodId}`);
      alert('HOD deleted successfully');
      await loadHodUsers();
      setHodMenuOpen(null);
    } catch (err) {
      alert('Failed to delete HOD: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-content" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          className="btn-primary"
          onClick={() => setShowAccess(s => !s)}
          style={{ width: 'auto', padding: '8px 14px' }}
        >
          {showAccess ? 'Close Access Control' : 'Access Control'}
        </button>
        <h2 style={{ margin: 0 }}>Manage Departments</h2>
      </div>

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
            <div style={{ fontSize: 20 }}>🏛️</div>
            <h3 style={{ margin: 0 }}>Access Control</h3>
          </div>
          <p style={{ color: '#666', marginTop: 0 }}>
            Approve or review pending HOD access requests here. Issue IDs and send verification emails once approved.
          </p>
          {reqLoading ? <p>Loading...</p> : (
            <div style={{ display:'grid', gap: 10 }}>
              {requests.map(r => (
                <div key={r._id}
                  style={{ display:'grid', gridTemplateColumns:'2fr auto 1.3fr auto', gap: 8, alignItems:'center',
                           padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                    <div style={{ color:'#666', fontSize: 13 }}>
                      {r.email} • {(r.requestedDepartment || r.hodInfo?.department || '-')} • {r.userId}
                    </div>
                  </div>

                  <div style={{ color: confirmed[r._id] ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {confirmed[r._id] ? 'Approved' : 'Pending'}
                  </div>

                  <div style={{ display:'flex', gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder="Employee ID"
                      value={newEmployeeId[r._id] || ''}
                      onChange={e => setNewEmployeeId(prev => ({ ...prev, [r._id]: e.target.value }))}
                    />
                  </div>

                  <div style={{ display:'flex', gap: 6, justifyContent:'flex-end', flexWrap:'wrap' }}>
                    <button className="btn-primary" onClick={() => onGenerateId(r)} style={{ width:'auto', padding:'6px 10px', background:'#374151' }}>
                      Generate ID
                    </button>

                    {!confirmed[r._id] && (
                      <button className="btn-primary" onClick={() => confirm(r._id)} style={{ width:'auto', padding:'6px 10px' }}>
                        Confirm
                      </button>
                    )}

                    {!r.isApproved && (
                      <button className="btn-primary" onClick={() => approve(r._id)} style={{ width:'auto', padding:'6px 10px', background:'#2563eb' }}>
                        Approve
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, margin: '10px 0 20px' }}>
        <input
          className="form-control"
          placeholder="Search by name, code, or HOD"
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
        />
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={loadDepartments}>Refresh</button>
      </div>

      {/* Registered HOD Users Section */}
      <div style={{ marginBottom: 24, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px' }}>Registered HOD Users</h3>
        {hodLoading ? (
          <p>Loading...</p>
        ) : hodUsers.length === 0 ? (
          <p style={{ color:'#666', margin: 0 }}>No HOD users registered yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {hodUsers.map(hod => (
              <div key={hod._id} style={{ background:'#fff', padding: 12, border:'1px solid #e5e7eb', borderRadius: 8, display:'grid', gridTemplateColumns:'repeat(4, 1fr) auto', gap: 12, alignItems:'center', position: 'relative' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color:'#666' }}>Name</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{hod.firstName} {hod.lastName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color:'#666' }}>Email</p>
                  <p style={{ margin: 0, fontSize: 14 }}>{hod.email}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color:'#666' }}>Department</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{hod.hodInfo?.department || hod.requestedDepartment || '-'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color:'#666' }}>User ID</p>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>{hod.userId}</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setHodMenuOpen(hodMenuOpen === hod._id ? null : hod._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: 18,
                      color: '#6b7280',
                      borderRadius: 4,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    ⋮
                  </button>
                  {hodMenuOpen === hod._id && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 999
                        }}
                        onClick={() => setHodMenuOpen(null)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 4,
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 1000,
                          minWidth: 120
                        }}
                      >
                        <button
                          onClick={() => deleteHod(hod._id)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: 8,
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(d => (
            <div key={d._id} style={{ background:'#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{d.name} ({d.code})</h3>
                  <p style={{ margin:0, color:'#666' }}>
                    Building: {d.building || '-'} • HOD: {d.hod?.name || 'Not assigned'}
                  </p>
                  <p style={{ margin:0, color:'#666' }}>
                    {d.description || 'No description'}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <button className="btn-primary" onClick={() => startEdit(d)} style={{ width:'auto', padding:'6px 12px', background:'#6b7280' }}>
                    Edit
                  </button>
                  <button className="btn-primary" onClick={() => deleteDepartment(d._id)} style={{ width:'auto', padding:'6px 12px', background:'#ef4444' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color:'#666' }}>No departments found.</p>}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 20, background:'#fff', border:'1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h3>Edit Department</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input className="form-control" value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Building</label>
              <input className="form-control" value={editing.building} onChange={e => setEditing({ ...editing, building: e.target.value })} />
            </div>
            <div className="form-group">
              <label>HOD User ID</label>
              <input className="form-control" value={editing.hodUserId} onChange={e => setEditing({ ...editing, hodUserId: e.target.value })} placeholder="e.g. HOD-CSE-2024-0001" />
            </div>
            <div className="form-group" style={{ gridColumn:'span 2' }}>
              <label>Description</label>
              <textarea className="form-control" rows="3" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
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

      <div style={{ marginTop: 24, background:'#fff', border:'1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h3>Add Department</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={creating.name} onChange={e => setCreating({ ...creating, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Code</label>
            <input className="form-control" value={creating.code} onChange={e => setCreating({ ...creating, code: e.target.value })} placeholder="e.g. CSE" />
          </div>
          <div className="form-group">
            <label>Building</label>
            <input className="form-control" value={creating.building} onChange={e => setCreating({ ...creating, building: e.target.value })} />
          </div>
          <div className="form-group">
            <label>HOD User ID</label>
            <input className="form-control" value={creating.hodUserId} onChange={e => setCreating({ ...creating, hodUserId: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn:'span 2' }}>
            <label>Description</label>
            <textarea className="form-control" rows="3" value={creating.description} onChange={e => setCreating({ ...creating, description: e.target.value })} />
          </div>
        </div>
        <button className="btn-primary" onClick={createDepartment} style={{ width:'auto', padding:'8px 16px', marginTop: 12 }}>
          Add Department
        </button>
      </div>
    </div>
  );
};

export default ManageDepartments;

