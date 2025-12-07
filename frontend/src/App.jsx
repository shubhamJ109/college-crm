import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import RoleSelector from './components/auth/RoleSelector';
import Verification from './components/auth/Verification';

// Registration Components
import StudentRegister from './components/registration/StudentRegister';
import FacultyRegister from './components/registration/FacultyRegister';
import AdminRegister from './components/registration/AdminRegister';
import ParentRegister from './components/registration/ParentRegister';
import HODRegister from './components/registration/HODRegister';
import AccountantRegister from './components/registration/AccountantRegister';
import LibrarianRegister from './components/registration/LibrarianRegister';
import PlacementOfficerRegister from './components/registration/PlacementOfficerRegister';
import AcademicDeanRegister from './components/registration/AcademicDeanRegister';

import ManageFaculty from './components/dashboards/admin/ManageFaculty';
import ManageStudent from './components/dashboards/admin/ManageStudent';
import ManageDepartments from './components/dashboards/admin/ManageDepartments';
import ManageCourses from './components/dashboards/admin/ManageCourses';

// Dashboard Components
import StudentAttendance from './components/dashboards/StudentAttendance';
import StudentDashboard from './components/dashboards/StudentDashboard';
import StudentAssignments from './components/dashboards/StudentAssignments.jsx';
import FacultyDashboard from './components/dashboards/FacultyDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import HODDashboard from './components/dashboards/HODDashboard';
import HODCourseManagement from './components/dashboards/HODCourseManagement';
import HODFacultyManagement from './components/dashboards/HODFacultyManagement';
import FacultyMyCourses from './components/dashboards/FacultyMyCourses';
import FacultyStudents from './components/dashboards/FacultyStudents';
import FacultyMarkAttendance from './components/dashboards/FacultyMarkAttendance';
import FacultyAssignments from './components/dashboards/FacultyAssignments.jsx';
import AccountantDashboard from './components/dashboards/AccountantDashboard';
import LibrarianDashboard from './components/dashboards/LibrarianDashboard';
import PlacementOfficerDashboard from './components/dashboards/PlacementOfficerDashboard';
import AcademicDeanDashboard from './components/dashboards/AcademicDeanDashboard';

import ProtectedRoute from './utils/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RoleSelector />} />
          <Route path="/verify" element={<Verification />} />
          
          {/* Registration Routes */}
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/faculty" element={<FacultyRegister />} />
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/register/parent" element={<ParentRegister />} />
          <Route path="/register/hod" element={<HODRegister />} />
          <Route path="/register/accountant" element={<AccountantRegister />} />
          <Route path="/register/librarian" element={<LibrarianRegister />} />
          <Route path="/register/placement" element={<PlacementOfficerRegister />} />
          <Route path="/register/academic-dean" element={<AcademicDeanRegister />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/attendance" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/assignments" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/faculty/courses" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyMyCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/faculty/assignments" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyAssignments />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard/faculty/students" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'hod']}>
                <FacultyStudents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/faculty/attendance" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyMarkAttendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/parent" 
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/hod" 
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <HODDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/accountant" 
            element={
              <ProtectedRoute allowedRoles={['accountant']}>
                <AccountantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/librarian" 
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/placement" 
            element={
              <ProtectedRoute allowedRoles={['placement_officer']}>
                <PlacementOfficerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/academic-dean"
            element={
              <ProtectedRoute allowedRoles={['academic_dean']}>
                <AcademicDeanDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/faculty"
            element={
              <ProtectedRoute allowedRoles={['admin','super_admin']}>
                <ManageFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin','super_admin']}>
                <ManageStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['admin','super_admin']}>
                <ManageDepartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin','super_admin']}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hod/courses"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <HODCourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hod/faculty"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <HODFacultyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/faculty/courses"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyMyCourses />
              </ProtectedRoute>
            }
          />
          
          {/* Error Routes */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
