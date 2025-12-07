import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const departments = ['CSE','ECE','MECH','CIVIL','IT','EEE'];
const years = ['FY','SY','TY'];

const genStudentIdFrom = (s) => {
  const dept = (s.studentInfo?.department || 'GEN').toUpperCase();
  const year = new Date().getFullYear();
  const seq = (s.userId || '').replace(/\D/g, '').slice(-4).padStart(4, '0') || '0001';
  return `STD-${dept}-${year}-${seq}`;
};

const ManageStudent = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState({ department: '', status: '', search: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showAccess, setShowAccess] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [newStudentId, setNewStudentId] = useState({});
  const [confirmed, setConfirmed] = useState({});

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filter.department) params.department = filter.department;
    if (filter.status) params.status = filter.status;
    if (filter.search) params.search = filter.search;

    const res = await api.get('/users/role/student', { params });
    setStudents(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line
  useEffect(() => { if (showAccess) loadRequests(); }, [showAccess]);

  const filtered = useMemo(() => {
    if (!filter.search) return students;
    const q = filter.search.toLowerCase();
    return students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.userId || '').toLowerCase().includes(q)
    );
  }, [students, filter.search]);

  const approve = async (id) => {
    await api.put(`/users/access/approve/${id}`);
    await load();
  };

  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const res = await api.get('/users/access/requests', { params: { role: 'student' } });
      const data = res.data.data || [];
      setRequests(data);
      const c = {};
      const ids = {};
      data.forEach(r => {
        c[r._id] = !!r.isApproved;
        ids[r._id] = r.employeeIdIssued || ids[r._id] || '';
      });
      setConfirmed(c);
      setNewStudentId(ids);
    } catch (err) {
      setRequests([]);
    }
    setReqLoading(false);
  };

  const confirm = async (id) => {
    await api.put(`/users/access/confirm/${id}`);
    setConfirmed(prev => ({ ...prev, [id]: true }));
  };

  const onGenerateId = (r) => {
    const generated = genStudentIdFrom(r);
    setNewStudentId(prev => ({ ...prev, [r._id]: generated }));
  };

  const saveIssuedId = async (id) => {
    const val = (newStudentId[id] || '').trim();
    if (!val) return alert('Generate/enter an ID first');
    await api.put(`/users/access/issue-id/${id}`, { employeeId: val });
    alert('Student ID saved');
  };

  const sendEmail = async (id) => {
    await api.post(`/users/access/send-id-email/${id}`);
    alert('Student ID email sent');
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    await loadRequests();
    await load();
  };

  const setStatus = async (id, status) => {
    await api.put(`/users/${id}`, { status });
    await load();
  };

  const startEdit = (s) => {
    setEditing({
      _id: s._id,
      phone: s.phone || '',
      department: s.studentInfo?.department || '',
      classYear: s.studentInfo?.classYear || '',
      division: s.studentInfo?.division || '',
      semester: s.studentInfo?.semester || 1
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    const body = {
      phone: editing.phone,
      studentInfo: {
        department: editing.department,
        classYear: editing.classYear,
        division: editing.division,
        semester: Number(editing.semester) || 1
      }
    };
    await api.put(`/users/${editing._id}`, body);
    setSaving(false);
    setEditing(null);
    await load();
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
        <h2 style={{ margin: 0 }}>Manage Students</h2>
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
            <div style={{ fontSize: 20 }}>🎓</div>
            <h3 style={{ margin: 0 }}>Access Control</h3>
          </div>
          <p style={{ color: '#666', marginTop: 0 }}>
            Approve or review pending student requests here, issue IDs, and send verification emails.
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
                      {(r.studentInfo?.department || '-')} • {(r.studentInfo?.classYear || '-')} • {r.userId}
                    </div>
                  </div>

                  <div style={{ color: confirmed[r._id] ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {confirmed[r._id] ? 'Approved' : 'Pending'}
                  </div>

                  <div style={{ display:'flex', gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder="Student ID"
                      value={newStudentId[r._id] || ''}
                      onChange={e => setNewStudentId(prev => ({ ...prev, [r._id]: e.target.value }))}
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

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(s => (
            <div key={s._id} style={{ background:'#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{s.firstName} {s.lastName}</h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    {s.userId} • {s.email} • {s.status}
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>
                    Dept: {s.studentInfo?.department || '-'} • Class: {s.studentInfo?.classYear || '-'} • Division: {s.studentInfo?.division || '-'} • Sem: {s.studentInfo?.semester ?? '-'}
                  </p>
                  {s.assignedFaculty && s.assignedFaculty.length > 0 && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f3f4f6', borderRadius: 6 }}>
                      <strong style={{ color: '#374151', fontSize: 14 }}>Assigned Faculty:</strong>
                      {s.assignedFaculty.map((af, idx) => (
                        <div key={idx} style={{ marginTop: 4, paddingLeft: 8, color: '#059669', fontSize: 13 }}>
                          • {af.facultyName} ({af.facultyUserId}) - Divisions: {af.divisions.join(', ')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={() => deleteStudent(s._id)} style={{ width:'auto', padding:'6px 12px', background:'#ef4444' }}>
                  Delete
                </button>
              </div>

              <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap', marginTop: 12 }}>
                {!s.isApproved && (
                  <button className="btn-primary" onClick={() => approve(s._id)} style={{ width: 'auto', padding:'8px 12px' }}>
                    Approve
                  </button>
                )}

                {s.status !== 'Active' && (
                  <button className="btn-primary" onClick={() => setStatus(s._id, 'Active')} style={{ width: 'auto', padding:'8px 12px' }}>
                    Activate
                  </button>
                )}

                {s.status === 'Active' && (
                  <button className="btn-primary" onClick={() => setStatus(s._id, 'Inactive')} style={{ width: 'auto', padding:'8px 12px', background:'#ef4444' }}>
                    Deactivate
                  </button>
                )}

                <button className="btn-primary" onClick={() => startEdit(s)} style={{ width: 'auto', padding:'8px 12px', background:'#6b7280' }}>
                  Edit
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p style={{ color:'#666' }}>No students found.</p>}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 20, background:'#fff', border:'1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h3>Edit Student</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-control" value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class Year</label>
              <select className="form-control" value={editing.classYear} onChange={e => setEditing({ ...editing, classYear: e.target.value })}>
                <option value="">Select Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Division</label>
              <input className="form-control" value={editing.division} onChange={e => setEditing({ ...editing, division: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input type="number" className="form-control" value={editing.semester} onChange={e => setEditing({ ...editing, semester: e.target.value })} min="1" max="8" />
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

export default ManageStudent;

