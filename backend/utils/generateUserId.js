const User = require('../models/User');

const generateUserId = async (role, additionalInfo = {}) => {
  const year = new Date().getFullYear();
  
  try {
    switch(role) {
      case 'super_admin': {
        const count = await User.countDocuments({ role: 'super_admin' });
        return `SA-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      
      case 'admin': {
        const count = await User.countDocuments({ role: 'admin' });
        return `ADM-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      
      case 'principal': {
        return `PRIN-${year}-001`;
      }

      case 'academic_dean': {
      const count = await User.countDocuments({ role: 'academic_dean' });
      return `ADEAN-${year}-${String(count + 1).padStart(3, '0')}`;
      }

      case 'hod': {
        const dept = additionalInfo.department || 'GEN';
        const count = await User.countDocuments({ role: 'hod' });
        return `HOD-${dept}-${year}-${String(count + 1).padStart(2, '0')}`;
      }
      
      case 'faculty': {
        const count = await User.countDocuments({ role: 'faculty' });
        return `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
      }
      
      case 'student': {
        const { classYear, department, division, rollNo } = additionalInfo;
        if (!classYear || !department || !division || !rollNo) {
          throw new Error('Student info incomplete for ID generation');
        }
        return `STU-${classYear}-${department}-${division}-${String(rollNo).padStart(2, '0')}`;
      }
      
      case 'parent': {
        const count = await User.countDocuments({ role: 'parent' });
        return `PAR-${year}-${String(count + 1).padStart(4, '0')}`;
      }
      
      case 'accountant': {
        const count = await User.countDocuments({ role: 'accountant' });
        return `ACC-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      
      case 'librarian': {
        const count = await User.countDocuments({ role: 'librarian' });
        return `LIB-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      
      case 'placement_officer': {
        const count = await User.countDocuments({ role: 'placement_officer' });
        return `PLO-${year}-${String(count + 1).padStart(3, '0')}`;
      }
      
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  } catch (error) {
    throw new Error(`User ID generation failed: ${error.message}`);
  }
};

module.exports = generateUserId;
