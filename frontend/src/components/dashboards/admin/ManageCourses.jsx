import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

const departments = ['CSE','ECE','MECH','CIVIL','IT','EEE'];

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
            Delete Course
          </button>
        </div>
      )}
    </div>
  );
};

const ManageCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState({ department: '', semester: '', search: '' });
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    semester: '',
    credits: '',
    courseType: 'Theory',
    description: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.department) params.department = filter.department;
      if (filter.semester) params.semester = filter.semester;
      if (filter.search) params.search = filter.search;

      const res = await api.get('/courses', { params });
      setCourses(res.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    if (!filter.search) return courses;
    const q = filter.search.toLowerCase();
    return courses.filter(c =>
      (c.courseName || '').toLowerCase().includes(q) ||
      (c.courseCode || '').toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q)
    );
  }, [courses, filter.search]);

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${id}`);
      await load();
    } catch (error) {
      alert('Error deleting course');
    }
  };

  const startEdit = (c) => {
    setEditing({
      _id: c._id,
      courseCode: c.courseCode || '',
      courseName: c.courseName || '',
      department: c.department || '',
      semester: c.semester || '',
      credits: c.credits || '',
      courseType: c.courseType || 'Theory',
      description: c.description || ''
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/courses/${editing._id}`, editing);
      setEditing(null);
      await load();
    } catch (error) {
      alert('Error saving course');
    }
    setSaving(false);
  };

  const createCourse = async () => {
    if (!newCourse.courseCode || !newCourse.courseName || !newCourse.department) {
      alert('Please fill in required fields: Course Code, Course Name, and Department');
      return;
    }
    setSaving(true);
    try {
      await api.post('/courses', newCourse);
      setNewCourse({
        courseCode: '',
        courseName: '',
        department: '',
        semester: '',
        credits: '',
        courseType: 'Theory',
        description: ''
      });
      setCreating(false);
      await load();
    } catch (error) {
      alert('Error creating course');
    }
    setSaving(false);
  };

  return (
    <div className="dashboard-content" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Manage Courses</h2>
        <button
          className="btn-primary"
          onClick={() => setCreating(s => !s)}
          style={{ width: 'auto', padding: '8px 14px' }}
        >
          {creating ? 'Cancel' : '+ Add New Course'}
        </button>
      </div>

      {/* Create Course Form */}
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 300ms ease, opacity 250ms ease, transform 300ms ease',
          maxHeight: creating ? 600 : 0,
          opacity: creating ? 1 : 0,
          transform: creating ? 'translateY(0px)' : 'translateY(-6px)'
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
          <h3 style={{ marginTop: 0 }}>Create New Course</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Course Code *</label>
              <input
                className="form-control"
                placeholder="e.g., CSE101"
                value={newCourse.courseCode}
                onChange={e => setNewCourse({ ...newCourse, courseCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Course Name *</label>
              <input
                className="form-control"
                placeholder="e.g., Data Structures"
                value={newCourse.courseName}
                onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select
                className="form-control"
                value={newCourse.department}
                onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select
                className="form-control"
                value={newCourse.semester}
                onChange={e => setNewCourse({ ...newCourse, semester: e.target.value })}
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Credits</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 4"
                value={newCourse.credits}
                onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Course Type</label>
              <select
                className="form-control"
                value={newCourse.courseType}
                onChange={e => setNewCourse({ ...newCourse, courseType: e.target.value })}
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Theory + Lab">Theory + Lab</option>
                <option value="Project">Project</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Course description..."
              value={newCourse.description}
              onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              className="btn-primary"
              onClick={createCourse}
              disabled={saving}
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              {saving ? 'Creating...' : 'Create Course'}
            </button>
            <button
              className="btn-primary"
              onClick={() => setCreating(false)}
              style={{ width: 'auto', padding: '8px 16px', background: '#6b7280' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 10, margin: '10px 0 20px' }}>
        <select
          className="form-control"
          value={filter.department}
          onChange={e => setFilter({ ...filter, department: e.target.value })}
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          className="form-control"
          value={filter.semester}
          onChange={e => setFilter({ ...filter, semester: e.target.value })}
        >
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>

        <input
          className="form-control"
          placeholder="Search course code, name, or department"
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
        />

        <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={load}>Apply</button>
      </div>

      {/* List */}
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(c => (
            <div key={c._id} style={{ background: '#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{c.courseCode} - {c.courseName}</h3>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    Department: {c.department} • Semester: {c.semester || 'N/A'} • Credits: {c.credits || 'N/A'}
                  </p>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    Type: {c.courseType || 'Theory'}
                  </p>
                  {c.description && (
                    <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
                      {c.description}
                    </p>
                  )}
                </div>
                <KebabMenu onDelete={() => deleteCourse(c._id)} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn-primary"
                  onClick={() => startEdit(c)}
                  style={{ width: 'auto', padding: '8px 12px', background: '#6b7280' }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p style={{ color: '#666' }}>No courses found.</p>}
        </div>
      )}

      {/* Edit Panel */}
      {editing && (
        <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <h3>Edit Course</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Course Code</label>
              <input
                className="form-control"
                value={editing.courseCode}
                onChange={e => setEditing({ ...editing, courseCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input
                className="form-control"
                value={editing.courseName}
                onChange={e => setEditing({ ...editing, courseName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                className="form-control"
                value={editing.department}
                onChange={e => setEditing({ ...editing, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select
                className="form-control"
                value={editing.semester}
                onChange={e => setEditing({ ...editing, semester: e.target.value })}
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Credits</label>
              <input
                type="number"
                className="form-control"
                value={editing.credits}
                onChange={e => setEditing({ ...editing, credits: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Course Type</label>
              <select
                className="form-control"
                value={editing.courseType}
                onChange={e => setEditing({ ...editing, courseType: e.target.value })}
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Theory + Lab">Theory + Lab</option>
                <option value="Project">Project</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              className="btn-primary"
              onClick={saveEdit}
              disabled={saving}
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn-primary"
              onClick={() => setEditing(null)}
              style={{ width: 'auto', padding: '8px 16px', background: '#6b7280' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
