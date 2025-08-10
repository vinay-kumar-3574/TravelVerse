const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();
const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const {
    email,
    password,
    fullName,
    dateOfBirth,
    gender,
    nationality,
    language,
    contact,
    preferredTravelMode
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create new user
  const user = new User({
    email,
    password,
    fullName,
    dateOfBirth,
    gender,
    nationality,
    language,
    contact,
    preferredTravelMode
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isOnboarded: user.isOnboarded
      },
      token
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact support.', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isOnboarded: user.isOnboarded,
        lastLogin: user.lastLogin
      },
      token
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  // This route will be protected by auth middleware
  // req.user will be set by the middleware
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token (you can implement email sending here)
  const resetToken = jwt.sign(
    { userId: user._id, type: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // In a real application, you would send this token via email
  // For now, we'll just return it (remove this in production)
  res.json({
    success: true,
    message: 'Password reset link sent to your email',
    data: {
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    }
  });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    throw new AppError('Reset token and new password are required', 400);
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      throw new AppError('Invalid reset token', 400);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Reset token has expired', 400);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid reset token', 400);
    }
    throw error;
  }
}));

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return a success message
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Generate new token
  const newToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: newToken
    }
  });
}));

// @desc    Complete user onboarding
// @route   POST /api/auth/onboarding
// @access  Private
router.post('/onboarding', authMiddleware, asyncHandler(async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    gender,
    nationality,
    language,
    contact,
    preferredTravelMode,
    travelDocuments,
    emergencyContact
  } = req.body;

  // Get user from auth middleware
  const user = req.user;

  // Update user with onboarding data
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      fullName,
      dateOfBirth,
      gender,
      nationality,
      language,
      contact,
      preferredTravelMode,
      travelDocuments,
      emergencyContact,
      isOnboarded: true
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isOnboarded: updatedUser.isOnboarded
      }
    }
  });
}));

module.exports = router;
