const Department = require('../models/Department');
const User = require('../models/User');

const resolveHodId = async (hodUserId) => {
  if (!hodUserId) return null;
  const hod = await User.findOne({
    role: 'hod',
    $or: [
      { _id: hodUserId },
      { userId: hodUserId }
    ]
  });
  if (!hod) {
    const error = new Error('HOD not found');
    error.statusCode = 400;
    throw error;
  }
  return hod._id;
};

const formatDepartment = (dept) => ({
  _id: dept._id,
  name: dept.name,
  code: dept.code,
  building: dept.building,
  description: dept.description,
  createdAt: dept.createdAt,
  updatedAt: dept.updatedAt,
  hod: dept.hodId ? {
    _id: dept.hodId._id,
    name: `${dept.hodId.firstName} ${dept.hodId.lastName}`,
    userId: dept.hodId.userId,
    email: dept.hodId.email
  } : null
});

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort('name').populate('hodId', 'firstName lastName userId email');
    res.json({ success: true, data: departments.map(formatDepartment) });
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, building, description, hodUserId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      building: building?.trim() || '',
      description: description?.trim() || ''
    };
    if (hodUserId) {
      payload.hodId = await resolveHodId(hodUserId);
    }
    const dept = await Department.create(payload);
    await dept.populate('hodId', 'firstName lastName userId email');
    res.status(201).json({ success: true, data: formatDepartment(dept) });
  } catch (err) {
    if (err.code === 11000) {
      err.statusCode = 400;
      err.message = 'Department name or code already exists';
    }
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, building, description, hodUserId } = req.body;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    if (name) dept.name = name.trim();
    if (code) dept.code = code.trim().toUpperCase();
    if (building !== undefined) dept.building = building;
    if (description !== undefined) dept.description = description;
    if (hodUserId !== undefined) {
      dept.hodId = hodUserId ? await resolveHodId(hodUserId) : null;
    }

    await dept.save();
    await dept.populate('hodId', 'firstName lastName userId email');
    res.json({ success: true, data: formatDepartment(dept) });
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};

