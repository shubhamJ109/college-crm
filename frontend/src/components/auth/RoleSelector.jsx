import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const RoleSelector = () => {
  const navigate = useNavigate();

  const roles = [
    { name: 'Student', icon: '🎓', path: '/register/student', color: '#667eea' },
    { name: 'Faculty', icon: '👨‍🏫', path: '/register/faculty', color: '#764ba2' },
    { name: 'Admin', icon: '👔', path: '/register/admin', color: '#f093fb' },
    { name: 'Principal', icon: '🎯', path: '/register/admin', color: '#4facfe' },
    { name: 'HOD', icon: '📚', path: '/register/hod', color: '#43e97b' },
    { name: 'Parent', icon: '👨‍👩‍👧', path: '/register/parent', color: '#fa709a' },
    { name: 'Accountant', icon: '💰', path: '/register/accountant', color: '#fee140' },
    { name: 'Librarian', icon: '📖', path: '/register/librarian', color: '#30cfd0' },
    { name: 'Placement Officer', icon: '💼', path: '/register/placement', color: '#a8edea' },
    { name: 'Academic Dean', icon: '🎓', path: '/register/academic-dean', color: '#4facfe' }

  ];

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '900px' }}>
        <h2>🎓 Select Your Role</h2>
        <p className="text-center" style={{ marginBottom: '30px', color: '#666' }}>
          Choose your role to register
        </p>

        <div className="role-grid">
          {roles.map((role) => (
            <div
              key={role.name}
              className="role-card"
              onClick={() => navigate(role.path)}
              style={{ borderColor: role.color }}
            >
              <div style={{ fontSize: '48px' }}>{role.icon}</div>
              <h3>{role.name}</h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-3">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
