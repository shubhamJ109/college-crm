import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on role
        const role = response.data.user.role;
        const dashboardRoutes = {
          'student': '/dashboard/student',
          'faculty': '/dashboard/faculty',
          'admin': '/dashboard/admin',
          'super_admin': '/dashboard/admin',
          'principal': '/dashboard/admin',
          'hod': '/dashboard/hod',
          'parent': '/dashboard/parent',
          'accountant': '/dashboard/accountant',
          'librarian': '/dashboard/librarian',
          'placement_officer': '/dashboard/placement',
          'academic_dean' : '/dashboard/academic-dean', // NEW
        };
        
        navigate(dashboardRoutes[role] || '/dashboard/student');
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 403 && data?.hold) {
        if (data.token) {
          localStorage.setItem('holdToken', data.token); // hold token for verification flow
          localStorage.removeItem('token');
        }
        navigate('/verify', { state: { stage: data.stage, user: data.user } });
        return;
      }
      setError(data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🎓 College CRM Login</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Login ID or Email</label>
            <input
              type="text"
              name="loginId"
              className="form-control"
              placeholder="Enter your User ID or Email"
              value={formData.loginId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
