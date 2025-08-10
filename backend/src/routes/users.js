const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, checkOwnership } = require('../middleware/auth');
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
router.get('/profile', authMiddleware, getProfile);

// Update user profile
router.put('/profile', authMiddleware, updateProfile);

// Get user by ID (admin or self)
router.get('/:id', authMiddleware, checkOwnership, getUserById);

// Update user by ID (admin or self)
router.put('/:id', authMiddleware, checkOwnership, updateUserById);

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteUser);

// Family member routes
router.get('/:id/family-members', authMiddleware, checkOwnership, getFamilyMembers);

router.post('/:id/family-members', authMiddleware, checkOwnership, addFamilyMember);

router.put('/:id/family-members/:memberId', authMiddleware, checkOwnership, updateFamilyMember);

router.delete('/:id/family-members/:memberId', authMiddleware, checkOwnership, deleteFamilyMember);

module.exports = router;
