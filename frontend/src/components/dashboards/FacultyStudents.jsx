import { useEffect, useState } from 'react';
import { getFacultyStudents } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [facultyInfo, setFacultyInfo] = useState({ department: '', assignedYears: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getFacultyStudents();
      console.log('Faculty Students Response:', response.data);
      setStudents(response.data.data || []);
      setFacultyInfo({
        department: response.data.facultyDepartment || '',
        assignedYears: response.data.assignedYears || []
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. ' + (error.response?.data?.message || ''));
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
          <h1>👥 Students Management</h1>
          <p style={{ margin: 0, color: '#666' }}>
            View and manage your students
            {facultyInfo.department && (
              <span style={{ marginLeft: 8, color: '#059669', fontWeight: 600 }}>
                • Department: {facultyInfo.department}
                {facultyInfo.assignedYears.length > 0 && ` • Years: ${facultyInfo.assignedYears.join(', ')}`}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/dashboard/faculty')} 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 20px', background: '#6b7280' }}
          >
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && <div className="alert alert-danger">{error}</div>}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '2px solid #e5e7eb',
          padding: '20px',
          minHeight: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {students.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Division</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.studentInfo?.rollNo || '-'}</td>
                    <td>{`${student.firstName} ${student.lastName}`}</td>
                    <td>{student.email}</td>
                    <td>{student.studentInfo?.department || '-'}</td>
                    <td>{student.studentInfo?.classYear || '-'}</td>
                    <td>{student.studentInfo?.division || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '50px' }}>
              <p style={{ fontSize: 16, color: '#666' }}>
                {facultyInfo.assignedYears.length === 0 
                  ? 'No work assignments found. Please contact your HOD to assign you years and courses.'
                  : 'No students found for your assigned department and years.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStudents;
