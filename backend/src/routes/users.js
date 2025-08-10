const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAllUsers,
  getProfile,
  updateProfile,
  getUserById,
  updateUserById,
  deleteUser,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
} = require('../controllers/userController');

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), getAllUsers);

// Get user profile
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-hashedPassword')
    .populate('familyMembers');
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
}));

// Update user profile
router.put('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth, preferences, emergencyContact } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone, dateOfBirth, preferences, emergencyContact },
    { new: true, runValidators: true }
  ).select('-hashedPassword');

  res.json(user);
}));

// Get user by ID (admin or self)
router.get('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-hashedPassword')
    .populate('familyMembers');
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
}));

// Update user by ID (admin or self)
router.put('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth, preferences, emergencyContact, role } = req.body;
  
  const updateData = { firstName, lastName, phone, dateOfBirth, preferences, emergencyContact };
  if (req.user.role === 'admin' && role) updateData.role = role;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-hashedPassword');

  res.json(user);
}));

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Also delete associated family members
  await FamilyMember.deleteMany({ userId: req.params.id });

  res.json({ message: 'User deleted successfully' });
}));

// Family member routes
router.get('/:id/family-members', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const familyMembers = await FamilyMember.find({ userId: req.params.id });
  res.json(familyMembers);
}));

router.post('/:id/family-members', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const familyMember = new FamilyMember({
    ...req.body,
    userId: req.params.id
  });
  
  await familyMember.save();
  res.status(201).json(familyMember);
}));

router.put('/:id/family-members/:memberId', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const familyMember = await FamilyMember.findOneAndUpdate(
    { _id: req.params.memberId, userId: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!familyMember) {
    return res.status(404).json({ message: 'Family member not found' });
  }

  res.json(familyMember);
}));

router.delete('/:id/family-members/:memberId', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const familyMember = await FamilyMember.findOneAndDelete({
    _id: req.params.memberId,
    userId: req.params.id
  });
  
  if (!familyMember) {
    return res.status(404).json({ message: 'Family member not found' });
  }

  res.json({ message: 'Family member deleted successfully' });
}));

module.exports = router;
