const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: false
  },
  nationality: {
    type: String,
    required: false
  },
  language: {
    type: String,
    required: false
  },
  contact: {
    type: String,
    required: false,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
  },
  preferredTravelMode: {
    type: String,
    enum: ['flight', 'train', 'bus', 'any'],
    default: 'any'
  },
  travelDocuments: {
    passport: {
      number: String,
      expiryDate: Date,
      issuingCountry: String
    },
    visa: {
      number: String,
      expiryDate: Date,
      issuingCountry: String
    },
    governmentId: {
      type: {
        type: String,
        enum: ['aadhar', 'driving-license', 'voter-id', 'pan', 'national-id']
      },
      number: String
    },
    visaStatus: {
      type: String,
      enum: ['not-required', 'valid', 'apply', 'on-arrival']
    },
    passengerType: {
      type: String,
      enum: ['general', 'senior-citizen', 'student', 'military']
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contact: String,
    email: String
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    budgetRange: {
      min: { type: Number, default: 10000 },
      max: { type: Number, default: 1000000 }
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'comfort', 'luxury'],
      default: 'comfort'
    },
    interests: [{
      type: String,
      enum: ['adventure', 'culture', 'relaxation', 'food', 'shopping', 'nature', 'history']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
