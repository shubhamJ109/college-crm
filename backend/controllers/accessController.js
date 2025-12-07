const User = require('../models/User');
const jwt = require('jsonwebtoken');
// Add your mailer util (e.g., nodemailer or a provider)

const { sendMail } = require('../utils/mailer'); // implement separately

exports.listAccessRequests = async (req, res) => {
  const { role='faculty', department } = req.query;
  const filter = { requestedRole: role };
  // Show all pending in faculty section: not approved OR approved but not verified
  filter.$or = [
    { isApproved: false },
    { isApproved: true, employeeIdVerified: false }
  ];
  if (department) filter.requestedDepartment = department;
  const data = await User.find(filter)
    .select('firstName lastName email role userId requestedDepartment requestedAt isApproved employeeIdIssued employeeIdVerified facultyInfo.designation hodInfo.department');
  res.json({ success: true, data });
};

exports.confirmStaff = async (req, res) => {
  const { id } = req.params;
  const u = await User.findById(id);
  if (!u) return res.status(404).json({ success: false, message: 'User not found' });
  u.isApproved = true;
  u.approvedBy = req.user._id;
  await u.save();
  res.json({ success: true, message: 'Admin approval confirmed' });
};

exports.issueEmployeeId = async (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body; // Admin supplies the ID (no auto-generate as per your rule)
  if (!employeeId || !employeeId.trim()) {
    return res.status(400).json({ success: false, message: 'Employee ID is required' });
  }
  const finalId = employeeId.trim();

  // Ensure uniqueness across staff collections
  const exists = await User.findOne({
    $or: [
      { 'adminInfo.employeeId': finalId },
      { 'academicDeanInfo.employeeId': finalId },
      { 'hodInfo.employeeId': finalId },
      { 'facultyInfo.employeeId': finalId },
      { 'studentInfo.studentId': finalId },
      { employeeIdIssued: finalId }
    ]
  });
  if (exists) return res.status(400).json({ success: false, message: 'Employee ID already in use' });

  const u = await User.findById(id);
  if (!u) return res.status(404).json({ success: false, message: 'User not found' });

  u.employeeIdIssued = finalId;
  u.employeeIdIssuedAt = new Date();
  await u.save();

  res.json({ success: true, message: 'Employee ID issued', employeeId: finalId });
};

exports.sendEmployeeIdEmail = async (req, res) => {
  const { id } = req.params;
  const u = await User.findById(id);
  if (!u) return res.status(404).json({ success:false, message:'User not found' });
  if (!u.isApproved) return res.status(400).json({ success:false, message:'Confirm user first' });
  if (!u.employeeIdIssued) return res.status(400).json({ success:false, message:'Issue an Employee ID first' });

  await sendMail({
    to: u.email,
    subject: 'Your Employee ID',
    html: `<p>Hello ${u.firstName},</p>
           <p>Your Employee ID is <strong>${u.employeeIdIssued}</strong>.</p>
           <p>Enter this ID on your verification page to unlock your dashboard.</p>`
  });

  u.employeeIdEmailSentAt = new Date();       // ← this flips the UI to green with input
  await u.save();

  res.json({ success:true, emailSentAt: u.employeeIdEmailSentAt });
};

// Called by faculty on the hold page when they enter the ID
exports.verifyEmployeeId = async (req, res) => {
  const { employeeId } = req.body;
  const u = await User.findById(req.user._id);
  if (!u) return res.status(404).json({ success:false, message:'User not found' });
  if (!u.isApproved) return res.status(403).json({ success:false, message:'Admin approval pending' });
  if (!u.employeeIdEmailSentAt) return res.status(400).json({ success:false, message:'Email not sent yet' });
  if (!u.employeeIdIssued) return res.status(400).json({ success:false, message:'Employee ID not issued' });

  // Simple rate limiting to prevent brute-force guessing of employee IDs
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  // Ensure fields exist on user doc; treat missing as zero
  const attempts = u.employeeIdAttempts || 0;
  const lastAttempt = u.employeeIdLastAttempt ? new Date(u.employeeIdLastAttempt).getTime() : 0;

  if (attempts >= MAX_ATTEMPTS && (now - lastAttempt) < WINDOW_MS) {
    return res.status(429).json({ success:false, message:'Too many verification attempts. Try again later.' });
  }

  if ((employeeId || '').trim() !== u.employeeIdIssued.trim()) {
    // increment attempts and record time
    u.employeeIdAttempts = attempts + 1;
    u.employeeIdLastAttempt = new Date();
    await u.save();
    return res.status(400).json({ success:false, message:'Invalid Employee ID' });
  }

  // Successful verification — persist to role profile and reset attempt counters
  if (u.role === 'faculty') {
    u.facultyInfo = { ...(u.facultyInfo || {}), employeeId: u.employeeIdIssued };
  } else if (u.role === 'student') {
    u.studentInfo = { ...(u.studentInfo || {}), studentId: u.employeeIdIssued };
  } else if (u.role === 'hod') {
    u.hodInfo = { ...(u.hodInfo || {}), employeeId: u.employeeIdIssued };
  }

  u.employeeIdVerified = true;
  u.employeeIdVerifiedAt = new Date();
  u.employeeIdAttempts = 0;
  u.employeeIdLastAttempt = null;
  await u.save();

  // Issue a full auth token now that verification is successful
  const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ success:true, message:'Verified', token });
};
