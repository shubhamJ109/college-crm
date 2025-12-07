import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getMe } from '../../services/api';

// Student view of assignments with Cloudinary upload stub
const StudentAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get user info
        const meRes = await getMe();
        const userData = meRes.data.data;
        setUser(userData);
        
        console.log('User data:', userData);
        console.log('Student info:', userData.studentInfo);
        
        // Then fetch assignments for this student
        const assignRes = await api.get('/assignments/my');
        console.log('Assignments response:', assignRes.data);
        
        if (assignRes.data.success) {
          setAssignments(assignRes.data.data || []);
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load assignments');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleCloudinaryUpload = async (assignment) => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Only images (PNG, JPG) and PDF files are allowed!');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB!');
        return;
      }
      
      try {
        setUploadingId(assignment._id);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post(`/assignments/${assignment._id}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          alert('Assignment submitted successfully! ✅');
          // Refresh assignments
          const assignRes = await api.get('/assignments/my');
          if (assignRes.data.success) {
            setAssignments(assignRes.data.data || []);
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert(err.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setUploadingId(null);
      }
    };
    
    input.click();
  };

  const handleDownload = async (fileUrl, fileName, mimeType) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1>🗂️ Assignments</h1>
          <p style={{ margin:0, color:'#666' }}>Your active course assignments</p>
        </div>
        <button onClick={() => navigate('/dashboard/student')} className="btn-primary" style={{ background:'#6b7280', width:'auto', padding:'10px 20px' }}>← Dashboard</button>
      </div>

      <div className="dashboard-content">
        <div style={{ background:'#fff', border:'2px solid #e5e7eb', borderRadius:'20px', padding:'28px' }}>
          {error && (
            <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'12px', padding:'16px', marginBottom:'20px', color:'#991b1b' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {user && (
            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:'12px', padding:'12px', marginBottom:'20px', fontSize:'13px', color:'#0c4a6e' }}>
              <strong>Your Details:</strong> {user.studentInfo?.classYear} Year, Division {user.studentInfo?.division}, Department: {user.studentInfo?.department}
            </div>
          )}

          {!loading && assignments.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 10px' }}>
              <div style={{ fontSize:'56px', marginBottom:'12px' }}>🗂️</div>
              <h3 style={{ margin:'0 0 8px' }}>No Assignments</h3>
              <p style={{ margin:0, color:'#6b7280' }}>Uploaded assignments from faculty will appear here.</p>
            </div>
          )}

          {assignments.map((a, i) => (
            <div key={a._id} style={{
              display:'flex', flexDirection:'column', gap:'8px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'16px 20px 16px 20px', marginBottom:'16px', position:'relative', paddingRight:'180px'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'15px', marginBottom:'4px' }}>
                    {a.course?.courseCode} — {a.course?.courseName}
                  </div>
                  <div style={{ fontSize:'12px', color:'#111827' }}>
                    <span style={{ fontWeight:600 }}>Assignment No:</span> {(i + 1)}
                  </div>
                </div>
                <div style={{ fontSize:'12px', color:'#6b7280', whiteSpace:'nowrap' }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ fontSize:'12px', color:'#374151', fontWeight:600 }}>
                {a.faculty?.facultyInfo?.designation ? `${a.faculty.facultyInfo.designation} ` : ''}
                {a.faculty?.firstName} {a.faculty?.lastName}
              </div>
              
              {a.description && (
                <div style={{ fontSize:'12px', color:'#4b5563', background:'#fff', padding:'8px', borderRadius:'8px', border:'1px solid #e5e7eb', marginTop:'4px' }}>
                  <strong>Note:</strong> {a.description}
                </div>
              )}

              <div style={{ position:'absolute', top:'16px', right:'16px', display:'flex', flexDirection:'column', gap:'8px', alignItems:'stretch' }}>
                <button
                  onClick={() => {
                    if(!a.fileUrl) return alert('No file attached');
                    // For PDF files, open in new tab with proper viewer
                    if(a.mimeType === 'application/pdf' || a.fileUrl.toLowerCase().endsWith('.pdf')) {
                      // Use Google Docs viewer for better PDF viewing experience
                      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(a.fileUrl)}&embedded=true`;
                      window.open(viewerUrl, '_blank');
                    } else {
                      // For images, open directly
                      window.open(a.fileUrl,'_blank');
                    }
                  }}
                  style={{ background:'#6366f1', color:'#fff', border:'none', padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                >
                  👁️ View
                </button>
                {a.fileUrl && (
                  <button 
                    onClick={() => {
                      const fileExtension = a.mimeType === 'application/pdf' ? 'pdf' : 
                                          a.mimeType?.includes('image') ? 'jpg' : 'file';
                      const fileName = `${a.course?.courseCode || 'Assignment'}_${i+1}.${fileExtension}`;
                      handleDownload(a.fileUrl, fileName, a.mimeType);
                    }}
                    title="Download Assignment"
                    style={{ background:'#10b981', color:'#fff', border:'none', padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', width:'100%', whiteSpace:'nowrap' }}
                  >
                    ⬇️ Download
                  </button>
                )}
                <button
                  disabled={uploadingId===a._id}
                  onClick={() => handleCloudinaryUpload(a)}
                  style={{ background:'#0ea5e9', color:'#fff', border:'none', padding:'8px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer', opacity: uploadingId===a._id?0.6:1, whiteSpace:'nowrap' }}
                >
                  📤 Upload
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
