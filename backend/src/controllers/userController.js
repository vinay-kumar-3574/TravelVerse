const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) query.role = role;

  const users = await User.find(query)
    .select('-hashedPassword')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-hashedPassword')
    .populate('familyMembers');
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { 
    firstName, 
    lastName, 
    phone, 
    dateOfBirth, 
    preferences, 
    emergencyContact,
    preferredTravelMode,
    language,
    nationality
  } = req.body;
  
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (preferences) updateData.preferences = preferences;
  if (emergencyContact) updateData.emergencyContact = emergencyContact;
  if (preferredTravelMode) updateData.preferredTravelMode = preferredTravelMode;
  if (language) updateData.language = language;
  if (nationality) updateData.nationality = nationality;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-hashedPassword');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// Get user by ID (admin or self)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-hashedPassword')
    .populate('familyMembers');
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// Update user by ID (admin or self)
const updateUserById = asyncHandler(async (req, res) => {
  const { 
    firstName, 
    lastName, 
    phone, 
    dateOfBirth, 
    preferences, 
    emergencyContact, 
    role 
  } = req.body;
  
  const updateData = { firstName, lastName, phone, dateOfBirth, preferences, emergencyContact };
  if (req.user.role === 'admin' && role) updateData.role = role;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-hashedPassword');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Also delete associated family members
  await FamilyMember.deleteMany({ userId: req.params.id });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get family members
const getFamilyMembers = asyncHandler(async (req, res) => {
  const familyMembers = await FamilyMember.find({ userId: req.user.id });
  
  res.json({
    success: true,
    data: familyMembers
  });
});

// Add family member
const addFamilyMember = asyncHandler(async (req, res) => {
  const familyMemberData = {
    ...req.body,
    userId: req.user.id
  };

  const familyMember = await FamilyMember.create(familyMemberData);
  
  res.status(201).json({
    success: true,
    message: 'Family member added successfully',
    data: familyMember
  });
});

// Update family member
const updateFamilyMember = asyncHandler(async (req, res) => {
  const familyMember = await FamilyMember.findOneAndUpdate(
    { _id: req.params.memberId, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!familyMember) {
    return res.status(404).json({ 
      success: false, 
      message: 'Family member not found' 
    });
  }

  res.json({
    success: true,
    message: 'Family member updated successfully',
    data: familyMember
  });
});

// Delete family member
const deleteFamilyMember = asyncHandler(async (req, res) => {
  const familyMember = await FamilyMember.findOneAndDelete({
    _id: req.params.memberId,
    userId: req.user.id
  });

  if (!familyMember) {
    return res.status(404).json({ 
      success: false, 
      message: 'Family member not found' 
    });
  }

  res.json({
    success: true,
    message: 'Family member deleted successfully'
  });
});

module.exports = {
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
};
