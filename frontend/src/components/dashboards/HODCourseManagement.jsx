import { useEffect, useState } from 'react';
import { getMe } from '../../services/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const HODCourseManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('=== FETCHING USER DATA ===');
      console.log('API URL:', api.defaults.baseURL);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await getMe();
      console.log('User data response status:', response.status);
      console.log('User data response:', response.data);
      
      const userData = response.data.data;
      console.log('Extracted user data:', userData);
      console.log('User hodInfo:', userData?.hodInfo);
      console.log('User requestedDepartment:', userData?.requestedDepartment);
      
      setUser(userData);
      
      // Load previously selected courses
      if (userData?.hodInfo?.selectedCourses) {
        console.log('Previously selected courses found:', userData.hodInfo.selectedCourses);
        console.log('Type:', typeof userData.hodInfo.selectedCourses);
        console.log('Is array:', Array.isArray(userData.hodInfo.selectedCourses));
        
        // Ensure it's an array
        const courses = Array.isArray(userData.hodInfo.selectedCourses) 
          ? userData.hodInfo.selectedCourses 
          : [];
        
        console.log('Setting selected courses:', courses);
        setSelectedCourses(courses);
      } else {
        console.log('No previously selected courses found');
        setSelectedCourses([]);
      }
    } catch (error) {
      console.error('=== ERROR FETCHING USER DATA ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      // Only navigate to login if it's an auth error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Auth error detected, navigating to login...');
        navigate('/login');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        console.error('Non-auth error:', errorMsg);
        alert('Error loading user data: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const department = user?.hodInfo?.department || user?.requestedDepartment;
      console.log('=== LOADING COURSES ===');
      console.log('Department:', department);
      console.log('Request URL:', '/courses');
      console.log('Query params:', { department });
      
      const res = await api.get('/courses', { params: { department } });
      console.log('Courses response status:', res.status);
      console.log('Courses response data:', res.data);
      
      const coursesData = res.data.data || [];
      console.log('Extracted courses:', coursesData);
      console.log('Number of courses:', coursesData.length);
      
      setCourses(coursesData);
    } catch (error) {
      console.error('=== ERROR LOADING COURSES ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      setCourses([]);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load courses';
      alert('Error loading courses: ' + errorMsg);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleReviewClick = () => {
    setShowReviewPopup(true);
    loadCourses();
  };

  const handleSelectCourse = (course) => {
    console.log('=== SELECTING COURSE ===');
    console.log('Course to select:', course);
    console.log('Course ID:', course._id);
    console.log('Current selected courses:', selectedCourses);
    
    const isAlreadySelected = selectedCourses.some(c => c._id === course._id);
    console.log('Is already selected:', isAlreadySelected);
    
    if (!isAlreadySelected) {
      const newSelectedCourses = [...selectedCourses, course];
      console.log('New selected courses:', newSelectedCourses);
      setSelectedCourses(newSelectedCourses);
    } else {
      console.log('Course already selected, skipping');
    }
  };

  const handleRemoveCourse = (courseId) => {
    console.log('=== REMOVING COURSE ===');
    console.log('Course ID to remove:', courseId);
    console.log('Current selected courses:', selectedCourses);
    
    const newSelectedCourses = selectedCourses.filter(c => c._id !== courseId);
    console.log('New selected courses after removal:', newSelectedCourses);
    
    setSelectedCourses(newSelectedCourses);
  };

  const handleSaveSelectedCourses = async () => {
    setSaving(true);
    try {
      const courseIds = selectedCourses.map(c => c._id);
      console.log('=== SAVING SELECTED COURSES ===');
      console.log('Course IDs:', courseIds);
      console.log('Request URL:', '/users/hod/selected-courses');
      console.log('Request payload:', { selectedCourses: courseIds });
      
      const response = await api.put('/users/hod/selected-courses', {
        selectedCourses: courseIds
      });
      
      console.log('Save response status:', response.status);
      console.log('Save response data:', response.data);
      
      if (response.data.success) {
        alert('Selected courses saved successfully!');
        // Refresh user data to get updated information
        await fetchUserData();
      } else {
        console.error('Response success is false:', response.data);
        alert('Failed to save courses: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('=== ERROR SAVING COURSES ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      let errorMessage = 'Failed to save courses';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isCourseSelected = (courseId) => {
    return selectedCourses.some(c => c._id === courseId);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="auth-container"><h2>Loading...</h2></div>;

  const department = user?.hodInfo?.department || user?.requestedDepartment || 'CSE';

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📚 Course Management</h1>
          <p style={{ margin: 0, color: '#666' }}>Manage {department} Department Courses</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Review Courses */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0 }}>📋 Review Courses</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Review and manage all {department} department courses</p>
            <button 
              className="btn-primary" 
              onClick={handleReviewClick}
              style={{ width: '100%', padding: '12px 16px' }}
            >
              Review {department} Courses
            </button>
          </div>

          {/* Card 2: Selected Courses */}
          <div 
            style={{ 
              background: '#fff', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h3 style={{ marginTop: 0 }}>{department} Courses</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
            </p>
            
            {selectedCourses.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                flex: 1
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '12px',
                  opacity: 0.3
                }}>
                  {department}
                </div>
                <p style={{ margin: 0, fontSize: '14px' }}>No courses selected yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Use "Review Courses" to select courses</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', flex: 1, marginBottom: '16px' }}>
                  {selectedCourses.map(course => (
                    <div 
                      key={course._id}
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#065f46' }}>
                          {course.courseCode}
                        </div>
                        <div style={{ fontSize: '13px', color: '#047857' }}>
                          {course.courseName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                          Sem {course.semester} • {course.credits} Credits
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(course._id)}
                        style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Save Button */}
                <button
                  onClick={handleSaveSelectedCourses}
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginTop: 'auto',
                    background: saving ? '#9ca3af' : '#10b981',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Courses'}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Review Courses Popup */}
      {showReviewPopup && (
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '80vh',
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
              <h2 style={{ margin: 0 }}>📚 Review {department} Courses</h2>
              <button
                onClick={() => setShowReviewPopup(false)}
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
              {loadingCourses ? (
                <p style={{ textAlign: 'center', color: '#666' }}>Loading courses...</p>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>No courses found</p>
                  <p style={{ fontSize: '14px' }}>There are no courses for {department} department yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {courses.map(course => (
                    <div 
                      key={course._id} 
                      style={{ 
                        background: isCourseSelected(course._id) ? '#f0fdf4' : '#f9fafb', 
                        padding: '16px', 
                        borderRadius: '10px', 
                        border: isCourseSelected(course._id) ? '2px solid #86efac' : '1px solid #e5e7eb',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#111827' }}>
                            {course.courseCode} - {course.courseName}
                          </h3>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Semester:</strong> {course.semester || 'N/A'}
                            </span>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Credits:</strong> {course.credits || 'N/A'}
                            </span>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                              <strong>Type:</strong> {course.courseType || 'Theory'}
                            </span>
                          </div>
                          {course.description && (
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0', lineHeight: '1.5' }}>
                              {course.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          <div style={{
                            background: course.isActive ? '#d1fae5' : '#fee2e2',
                            color: course.isActive ? '#065f46' : '#991b1b',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <button
                            onClick={() => handleSelectCourse(course)}
                            disabled={isCourseSelected(course._id)}
                            style={{
                              background: isCourseSelected(course._id) ? '#10b981' : '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 16px',
                              fontSize: '13px',
                              cursor: isCourseSelected(course._id) ? 'not-allowed' : 'pointer',
                              fontWeight: 500,
                              opacity: isCourseSelected(course._id) ? 0.6 : 1
                            }}
                          >
                            {isCourseSelected(course._id) ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
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
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowReviewPopup(false)}
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 24px', background: '#6b7280' }}
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

export default HODCourseManagement;
