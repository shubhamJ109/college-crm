import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const HODFacultyManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [showAssignWorkPopup, setShowAssignWorkPopup] = useState(false);
  const [showViewWorkPopup, setShowViewWorkPopup] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [assignWorkData, setAssignWorkData] = useState({
    year: '',
    divisions: [],
    courses: [],
    description: ''
  });
  const [assignments, setAssignments] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState({});
  const [facultyAssignedWork, setFacultyAssignedWork] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadFaculties();
      loadCourses();
    }
  }, [user]); // eslint-disable-line

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

  const loadCourses = async () => {
    try {
      const department = user?.hodInfo?.department || user?.requestedDepartment;
      const res = await api.get('/courses', { params: { department } });
      setAvailableCourses(res.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setAvailableCourses([]);
    }
  };

  const loadFaculties = async () => {
    setLoadingFaculties(true);
    try {
      console.log('Full User Object:', user);
      console.log('hodInfo:', user?.hodInfo);
      console.log('requestedDepartment:', user?.requestedDepartment);
      
      const department = user?.hodInfo?.department || user?.requestedDepartment;
      console.log('HOD Department to send:', department);
      
      if (!department) {
        console.error('No department found for HOD!');
        setFaculties([]);
        setLoadingFaculties(false);
        return;
      }
      
      // Fetch all faculty and filter by department
      console.log('Making API call with department:', department);
      const res = await api.get('/users/role/faculty', { 
        params: { department } 
      });
      
      console.log('Faculty Response:', res.data);
      setFaculties(res.data.data || []);
    } catch (error) {
      console.error('Error loading faculties:', error);
      setFaculties([]);
    }
    setLoadingFaculties(false);
  };

  const handleAssignWork = (faculty) => {
    setSelectedFaculty(faculty);
    setAssignWorkData({
      year: '',
      divisions: [],
      courses: [],
      description: ''
    });
    setAssignments([]);
    setShowAssignWorkPopup(true);
  };

  const handleYearSelect = (year) => {
    setAssignWorkData({ ...assignWorkData, year, divisions: [], courses: [] });
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = assignWorkData[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setAssignWorkData({ ...assignWorkData, [field]: newValues });
  };

  const handleApplyAssignment = () => {
    if (!assignWorkData.year || assignWorkData.divisions.length === 0 || assignWorkData.courses.length === 0) {
      alert('Please select year, at least one division, and at least one course');
      return;
    }

    const newAssignment = {
      id: Date.now(),
      year: assignWorkData.year,
      divisions: [...assignWorkData.divisions],
      courses: assignWorkData.courses.map(courseId => 
        availableCourses.find(c => c._id === courseId)
      ),
      description: assignWorkData.description
    };

    setAssignments([...assignments, newAssignment]);
    
    // Reset form for next assignment
    setAssignWorkData({
      year: '',
      divisions: [],
      courses: [],
      description: ''
    });
  };

  const handleRemoveAssignment = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const handleSubmitAllAssignments = async () => {
    if (assignments.length === 0) {
      alert('Please add at least one assignment');
      return;
    }

    try {
      console.log('Submitting assignments for faculty:', selectedFaculty._id);
      console.log('Assignments to submit:', assignments);
      
      // Save assignments to database
      const response = await api.post('/work-assignments', {
        facultyId: selectedFaculty._id,
        assignments
      });

      console.log('Assignment submission response:', response.data);

      if (response.data.success) {
        // Update local state
        setFacultyAssignments({
          ...facultyAssignments,
          [selectedFaculty._id]: [
            ...(facultyAssignments[selectedFaculty._id] || []),
            ...response.data.data
          ]
        });

        alert('All work assigned successfully!');
        setShowAssignWorkPopup(false);
        setAssignments([]);
        
        // Reload faculties to reflect updated assignment counts
        loadFaculties();
      }
    } catch (error) {
      console.error('Error submitting assignments:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to assign work. Please try again.');
    }
  };

  const handleViewAssignedWork = async (faculty) => {
    setSelectedFaculty(faculty);
    setFacultyAssignedWork([]); // Reset first
    try {
      // Fetch real-time assigned work from database
      const response = await api.get(`/work-assignments/faculty/${faculty._id}`);
      console.log('Fetched assigned work:', response.data);
      if (response.data.success) {
        setFacultyAssignedWork(response.data.data || []);
      } else {
        setFacultyAssignedWork([]);
      }
    } catch (error) {
      console.error('Error fetching assigned work:', error);
      console.error('Error details:', error.response?.data);
      setFacultyAssignedWork([]);
    }
    setShowViewWorkPopup(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  const department = user?.hodInfo?.department || user?.requestedDepartment || 'CSE';
  
  const years = ['FY', 'SY', 'TY'];
  const divisions = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>👥 Faculty Management</h1>
          <p style={{ margin: 0, color: '#666' }}>Manage {department} Department Faculty</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Faculty Card */}
        <div 
          style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'relative',
            minHeight: '400px'
          }}
        >
          {/* Watermark */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#e5e7eb',
            opacity: 0.15,
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            whiteSpace: 'nowrap'
          }}>
            {department} FACULTIES
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📋 {department} Department Faculty</h3>
              <div style={{ 
                background: '#dbeafe', 
                color: '#1e40af', 
                padding: '6px 14px', 
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {faculties.length} Faculty {faculties.length !== 1 ? 'Members' : 'Member'}
              </div>
            </div>

            {loadingFaculties ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                <p>Loading faculties...</p>
              </div>
            ) : faculties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
                <p style={{ fontSize: '16px', margin: '0 0 8px', fontWeight: 500 }}>No faculty members found</p>
                <p style={{ fontSize: '14px', margin: 0 }}>There are no registered faculty for {department} department yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {faculties.map(faculty => (
                  <div 
                    key={faculty._id}
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '16px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#111827' }}>
                          {faculty.firstName} {faculty.lastName}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            <strong>User ID:</strong> {faculty.userId}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            <strong>Email:</strong> {faculty.email}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            <strong>Phone:</strong> {faculty.phone || 'N/A'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            <strong>Department:</strong> {faculty.facultyInfo?.department || faculty.requestedDepartment || 'N/A'}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          {faculty.facultyInfo?.designation && (
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Designation:</strong> {faculty.facultyInfo.designation}
                            </div>
                          )}
                          {faculty.facultyInfo?.experience !== undefined && (
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Experience:</strong> {faculty.facultyInfo.experience} years
                            </div>
                          )}
                          {faculty.facultyInfo?.employeeId && (
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Employee ID:</strong> {faculty.facultyInfo.employeeId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{
                          background: faculty.status === 'Active' ? '#d1fae5' : faculty.status === 'Suspended' ? '#fee2e2' : '#fef3c7',
                          color: faculty.status === 'Active' ? '#065f46' : faculty.status === 'Suspended' ? '#991b1b' : '#92400e',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {faculty.status === 'Active' ? 'Active' : faculty.status === 'Suspended' ? 'Suspended' : 'Pending'}
                        </div>
                        <button
                          onClick={() => handleViewAssignedWork(faculty)}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            marginTop: '4px'
                          }}
                        >
                          View Assigned Work
                        </button>
                        <button
                          onClick={() => handleAssignWork(faculty)}
                          style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          Assign Work
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Work Popup */}
      {showAssignWorkPopup && selectedFaculty && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Popup Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: '0 0 4px' }}>📝 Assign Work</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Assign to: {selectedFaculty.firstName} {selectedFaculty.lastName}
                </p>
              </div>
              <button
                onClick={() => setShowAssignWorkPopup(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0 8px'
                }}
              >
                ×
              </button>
            </div>

            {/* Popup Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Select Year (Single Selection) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Select Year * (Choose One)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: assignWorkData.year === year ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        background: assignWorkData.year === year ? '#dbeafe' : '#fff',
                        color: assignWorkData.year === year ? '#1e40af' : '#374151',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: assignWorkData.year === year ? 600 : 400,
                        transition: 'all 0.2s'
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                {assignWorkData.year && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#059669' }}>
                    Selected: {assignWorkData.year}
                  </div>
                )}
              </div>

              {/* Select Divisions (Multiple) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Select Divisions * (Multiple)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {divisions.map(division => (
                    <button
                      key={division}
                      onClick={() => handleMultiSelectChange('divisions', division)}
                      disabled={!assignWorkData.year}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: assignWorkData.divisions.includes(division) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        background: assignWorkData.divisions.includes(division) ? '#dbeafe' : '#fff',
                        color: assignWorkData.divisions.includes(division) ? '#1e40af' : '#374151',
                        cursor: assignWorkData.year ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: assignWorkData.divisions.includes(division) ? 600 : 400,
                        transition: 'all 0.2s',
                        opacity: assignWorkData.year ? 1 : 0.5
                      }}
                    >
                      {division}
                    </button>
                  ))}
                </div>
                {assignWorkData.divisions.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#059669' }}>
                    Selected: {assignWorkData.divisions.join(', ')}
                  </div>
                )}
              </div>

              {/* Select Courses (Multiple) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Select Courses * (Multiple)
                </label>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '8px',
                  opacity: assignWorkData.year ? 1 : 0.5,
                  pointerEvents: assignWorkData.year ? 'auto' : 'none'
                }}>
                  {availableCourses.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '12px' }}>
                      No courses available
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {availableCourses.map(course => (
                        <button
                          key={course._id}
                          onClick={() => handleMultiSelectChange('courses', course._id)}
                          disabled={!assignWorkData.year}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: assignWorkData.courses.includes(course._id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            background: assignWorkData.courses.includes(course._id) ? '#dbeafe' : '#f9fafb',
                            color: '#374151',
                            cursor: assignWorkData.year ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: assignWorkData.courses.includes(course._id) ? 600 : 500 }}>
                            {course.courseCode} - {course.courseName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            Sem {course.semester} • {course.credits} Credits
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {assignWorkData.courses.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#059669' }}>
                    {assignWorkData.courses.length} course(s) selected
                  </div>
                )}
              </div>

              {/* Description (Optional) */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Additional Information (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add any additional notes or instructions..."
                  value={assignWorkData.description}
                  onChange={e => setAssignWorkData({ ...assignWorkData, description: e.target.value })}
                  disabled={!assignWorkData.year}
                  style={{ 
                    resize: 'vertical',
                    fontSize: '14px',
                    opacity: assignWorkData.year ? 1 : 0.5
                  }}
                />
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyAssignment}
                disabled={!assignWorkData.year || assignWorkData.divisions.length === 0 || assignWorkData.courses.length === 0}
                style={{
                  width: '100%',
                  background: (!assignWorkData.year || assignWorkData.divisions.length === 0 || assignWorkData.courses.length === 0) ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  cursor: (!assignWorkData.year || assignWorkData.divisions.length === 0 || assignWorkData.courses.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}
              >
                ✓ Apply
              </button>

              {/* Applied Assignments List */}
              {assignments.length > 0 && (
                <div style={{ 
                  borderTop: '2px solid #e5e7eb', 
                  paddingTop: '20px',
                  marginTop: '10px'
                }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: '#111827' }}>
                    Applied Assignments ({assignments.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignments.map(assignment => (
                      <div 
                        key={assignment.id}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '6px' }}>
                              Year: {assignment.year}
                            </div>
                            <div style={{ fontSize: '13px', color: '#047857', marginBottom: '4px' }}>
                              <strong>Divisions:</strong> {assignment.divisions.join(', ')}
                            </div>
                            <div style={{ fontSize: '13px', color: '#047857', marginBottom: '4px' }}>
                              <strong>Courses:</strong> {assignment.courses.map(c => c.courseCode).join(', ')}
                            </div>
                            {assignment.description && (
                              <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px', fontStyle: 'italic' }}>
                                Note: {assignment.description}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              marginLeft: '8px'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {assignments.length > 0 && `${assignments.length} assignment(s) ready`}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAssignWorkPopup(false)}
                  style={{
                    background: '#fff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAllAssignments}
                  disabled={assignments.length === 0}
                  style={{
                    background: assignments.length === 0 ? '#9ca3af' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    cursor: assignments.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  Submit All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Assigned Work Popup */}
      {showViewWorkPopup && selectedFaculty && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Popup Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff'
            }}>
              <div>
                <h2 style={{ margin: '0 0 4px', color: '#fff' }}>📋 Assigned Work</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#e9d5ff' }}>
                  Faculty: {selectedFaculty.firstName} {selectedFaculty.lastName}
                </p>
              </div>
              <button
                onClick={() => setShowViewWorkPopup(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: '0 8px',
                  borderRadius: '6px'
                }}
              >
                ×
              </button>
            </div>

            {/* Popup Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {facultyAssignedWork.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                  <p style={{ fontSize: '18px', margin: '0 0 8px', fontWeight: 500, color: '#6b7280' }}>
                    No Work Assigned Yet
                  </p>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    This faculty member has not been assigned any courses yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {facultyAssignedWork.map(work => (
                    <div 
                      key={work._id}
                      style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        border: '2px solid #fbbf24',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          display: 'inline-block',
                          background: '#92400e',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 700,
                          marginBottom: '12px'
                        }}>
                          Year: {work.year}
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f', marginBottom: '4px' }}>
                          📍 Divisions:
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flexWrap: 'wrap' 
                        }}>
                          {work.divisions.map((div, idx) => (
                            <span 
                              key={idx}
                              style={{
                                background: '#fff',
                                border: '1px solid #f59e0b',
                                color: '#92400e',
                                padding: '4px 10px',
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

                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f', marginBottom: '6px' }}>
                          📚 Courses:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {work.courses.map((course, idx) => (
                            <div 
                              key={idx}
                              style={{
                                background: '#fff',
                                border: '1px solid #fbbf24',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '13px',
                                color: '#78350f'
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{course.courseCode}</span> - {course.courseName}
                              <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                                Semester: {course.semester} • Credits: {course.credits}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {work.description && (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px 12px',
                          background: '#fff',
                          border: '1px solid #fbbf24',
                          borderRadius: '6px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#78350f', marginBottom: '4px' }}>
                            📝 Additional Notes:
                          </div>
                          <div style={{ fontSize: '13px', color: '#92400e', fontStyle: 'italic' }}>
                            {work.description}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Total: {facultyAssignedWork.length}
              </div>
              <button
                onClick={() => setShowViewWorkPopup(false)}
                className="btn-primary"
                style={{
                  width: 'auto',
                  padding: '10px 24px',
                  background: '#6b7280'
                }}
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

export default HODFacultyManagement;
