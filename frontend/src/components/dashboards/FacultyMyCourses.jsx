import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const FacultyMyCourses = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      console.log('Fetching assignments for faculty...');
      const response = await api.get('/work-assignments/my-assignments');
      console.log('Assignments response:', response.data);
      if (response.data.success) {
        console.log('Assignments data:', response.data.data);
        setAssignments(response.data.data);
      } else {
        console.warn('No assignments found or unsuccessful response');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      console.error('Error details:', error.response?.data);
      setAssignments([]);
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
          <h1>📚 My Courses</h1>
          <p style={{ margin: 0, color: '#666' }}>Courses assigned to you by your HOD</p>
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
        {/* Faculty Info Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '24px', 
          borderRadius: '12px', 
          color: 'white', 
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 8px', color: '#fff' }}>{user?.firstName} {user?.lastName}</h2>
              <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Employee ID:</strong> {user?.facultyInfo?.employeeId}</p>
              <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Department:</strong> {user?.facultyInfo?.department || user?.requestedDepartment}</p>
              <p style={{ margin: '0', fontSize: '14px' }}><strong>Designation:</strong> {user?.facultyInfo?.designation}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '4px' }}>
                {assignments.reduce((total, work) => total + (work.courses?.length || 0), 0)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Courses</div>
            </div>
          </div>
        </div>

        {/* Course Assignments */}
        {assignments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            background: '#fff',
            borderRadius: '12px',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '18px', margin: '0 0 8px', fontWeight: 500, color: '#6b7280' }}>
              No Courses Assigned Yet
            </p>
            <p style={{ fontSize: '14px', margin: 0, color: '#9ca3af' }}>
              Your HOD has not assigned any courses to you yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {assignments.map(work => (
              <div 
                key={work._id}
                style={{
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onClick={() => setSelectedAssignment(work)}
              >
                {/* Card Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  padding: '16px 20px',
                  color: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>
                      Year {work.year}
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.3)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}>
                      {work.courses?.length || 0} Course{(work.courses?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px' }}>
                  {/* Divisions */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📍 Divisions
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {work.divisions.map((div, idx) => (
                        <span 
                          key={idx}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {div}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Courses List */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📚 Courses
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {work.courses && work.courses.length > 0 ? (
                        work.courses.slice(0, 3).map((course, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '10px 12px'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '4px' }}>
                              {course.courseCode} - {course.courseName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              Sem {course.semester} • {course.credits} Credits
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>No courses assigned</div>
                      )}
                      {work.courses && work.courses.length > 3 && (
                        <div style={{ fontSize: '12px', color: '#667eea', fontWeight: 600, textAlign: 'center', marginTop: '4px' }}>
                          +{work.courses.length - 3} more courses
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedAssignment(work)}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    View Full Details →
                  </button>
                </div>

                {/* Card Footer */}
                <div style={{
                  padding: '12px 20px',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '11px',
                  color: '#6b7280'
                }}>
                  Assigned by: {work.hod?.firstName} {work.hod?.lastName} • {new Date(work.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed View Popup */}
      {selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            {/* Popup Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '24px' }}>📚 Course Assignment Details</h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#e9d5ff' }}>
                    Year {selectedAssignment.year} Assignment
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#fff',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Popup Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Divisions Section */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#111827', 
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📍 Assigned Divisions
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedAssignment.divisions.map((div, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      Division {div}
                    </span>
                  ))}
                </div>
              </div>

              {/* Courses Section */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#111827', 
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📚 Assigned Courses ({selectedAssignment.courses?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedAssignment.courses && selectedAssignment.courses.length > 0 ? (
                    selectedAssignment.courses.map((course, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          border: '2px solid #fbbf24',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{
                            background: '#92400e',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {course.courseCode}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#78350f', marginBottom: '8px' }}>
                          {course.courseName}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '16px', 
                          fontSize: '13px', 
                          color: '#92400e',
                          borderTop: '1px solid #fbbf24',
                          paddingTop: '8px',
                          marginTop: '8px'
                        }}>
                          <div>
                            <strong>Semester:</strong> {course.semester}
                          </div>
                          <div>
                            <strong>Credits:</strong> {course.credits}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px', 
                      color: '#9ca3af',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      No courses assigned in this work assignment
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {selectedAssignment.description && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#111827', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📝 Additional Notes
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6',
                    fontStyle: 'italic'
                  }}>
                    {selectedAssignment.description}
                  </div>
                </div>
              )}

              {/* Assignment Info */}
              <div style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                color: '#4338ca'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Assigned by:</strong> {selectedAssignment.hod?.firstName} {selectedAssignment.hod?.lastName}
                </div>
                <div>
                  <strong>Assigned on:</strong> {new Date(selectedAssignment.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Popup Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedAssignment(null)}
                style={{
                  padding: '12px 32px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMyCourses;
