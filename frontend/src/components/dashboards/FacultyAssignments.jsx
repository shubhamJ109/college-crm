import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getMe } from '../../services/api';

// Lightweight assignments page (faculty) showing each course assignment record
const FacultyAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [description, setDescription] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [viewYear, setViewYear] = useState('');
  const [viewDivision, setViewDivision] = useState('');
  const [viewCourse, setViewCourse] = useState('');

  // derive dropdowns from assignments
  const normalizeYear = (y) => (y === 'FRY' || y === 'Final Year') ? 'TY' : y;
  const availableYears = [...new Set(assignments.map(a => normalizeYear(a.year)))];
  const availableDivisions = selectedYear
    ? [...new Set(assignments.filter(a => normalizeYear(a.year) === selectedYear).flatMap(a => a.divisions))]
    : [];
  const availableCourses = (selectedYear && selectedDivision)
    ? assignments
        .filter(a => normalizeYear(a.year) === selectedYear && a.divisions.includes(selectedDivision))
        .flatMap(a => a.courses)
        .filter((c, i, self) => c && self.findIndex(x => x._id === c._id) === i)
    : [];

  const handleUpload = async () => {
    if (!selectedYear || !selectedDivision || !selectedCourse || !description.trim()) {
      alert('Select year, division, course, and add description');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('year', selectedYear);
        form.append('division', selectedDivision);
        form.append('courseId', selectedCourse);
        form.append('description', description);
        const res = await api.post('/assignments/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) {
          alert('Assignment uploaded');
          setDescription('');
        }
      } catch (err) {
        console.error('Upload failed', err);
        alert(err?.response?.data?.message || 'Upload failed');
      }
    };
    input.click();
  };

  const fetchSubmissions = async () => {
    if (!viewYear || !viewDivision || !viewCourse) {
      setSubmissions([]);
      return;
    }
    try {
      const res = await api.get(`/assignments/submissions?year=${viewYear}&division=${viewDivision}&courseId=${viewCourse}`);
      if (res.data.success) {
        setSubmissions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [viewYear, viewDivision, viewCourse]);


  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me.data.data);
        const res = await api.get('/work-assignments/my-assignments');
        if (res.data.success) setAssignments(res.data.data || []);
      } catch (e) {
        console.error('Error loading assignments page:', e);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📦 Assignments</h1>
          <p style={{ margin: 0, color: '#666' }}>All course/division assignments given by your HOD</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard/faculty')} className="btn-primary" style={{ background:'#6b7280', width:'auto', padding:'10px 20px' }}>← Dashboard</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn-primary" style={{ width:'auto', padding:'10px 20px' }}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div style={{ background:'#fff', border:'2px solid #e5e7eb', borderRadius:'16px', padding:'24px', marginBottom:'24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Year</label>
              <select className="form-control" value={selectedYear} onChange={(e)=>{ setSelectedYear(e.target.value); setSelectedDivision(''); setSelectedCourse(''); }}>
                <option value="">-- Select Year --</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Division</label>
              <select className="form-control" value={selectedDivision} onChange={(e)=>{ setSelectedDivision(e.target.value); setSelectedCourse(''); }} disabled={!selectedYear}>
                <option value="">-- Select Division --</option>
                {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Course</label>
              <select className="form-control" value={selectedCourse} onChange={(e)=> setSelectedCourse(e.target.value)} disabled={!selectedYear || !selectedDivision}>
                <option value="">-- Select Course --</option>
                {availableCourses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'12px', marginTop:'16px', alignItems:'start' }}>
            <textarea
              className="form-control"
              placeholder="Description"
              rows={4}
              value={description}
              onChange={(e)=> setDescription(e.target.value)}
            />
            <button onClick={handleUpload} className="btn-primary" style={{ height:42, alignSelf:'center', padding:'0 18px' }}>Upload Assignment</button>
          </div>
        </div>

        <div style={{ background:'#fff', border:'2px solid #e5e7eb', borderRadius:'16px', padding:'24px', marginBottom:'24px' }}>
          <h3 style={{ marginTop:0, marginBottom:16 }}>📥 Student Submissions</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Year</label>
              <select className="form-control" value={viewYear} onChange={(e)=>{ setViewYear(e.target.value); setViewDivision(''); setViewCourse(''); }}>
                <option value="">-- Select Year --</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Division</label>
              <select className="form-control" value={viewDivision} onChange={(e)=>{ setViewDivision(e.target.value); setViewCourse(''); }} disabled={!viewYear}>
                <option value="">-- Select Division --</option>
                {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight:600, marginBottom:6, display:'block' }}>Select Course</label>
              <select className="form-control" value={viewCourse} onChange={(e)=> setViewCourse(e.target.value)} disabled={!viewYear || !viewDivision}>
                <option value="">-- Select Course --</option>
                {availableCourses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop:'20px' }}>
            {!viewYear || !viewDivision || !viewCourse ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af', background:'#f9fafb', borderRadius:'8px' }}>
                Select year, division, and course to view student submissions
              </div>
            ) : submissions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af', background:'#f9fafb', borderRadius:'8px' }}>
                No submissions yet for selected filters
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {(() => {
                  const pdfSubs = submissions.filter(s => s.mimeType === 'application/pdf');
                  if (pdfSubs.length === 0) {
                    return <div style={{ textAlign:'center', padding:'20px', background:'#f3f4f6', borderRadius:'8px', color:'#6b7280' }}>No PDF submissions available</div>;
                  }
                  return pdfSubs.map(sub => (
                    <div key={sub._id} style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'15px' }}>{sub.student?.name || 'Student'}</div>
                        <div style={{ fontSize:'13px', color:'#6b7280', marginTop:4 }}>
                          PRN: {sub.student?.prn || 'N/A'} • Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => window.open(sub.fileUrl, '_blank')}
                          className="btn-primary"
                          style={{ width:'auto', padding:'8px 16px', fontSize:'14px' }}
                        >
                          View PDF Submission
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>



      </div>
    </div>
  );
};

export default FacultyAssignments;
