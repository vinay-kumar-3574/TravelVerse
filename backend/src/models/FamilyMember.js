const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: [true, 'Gender is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  language: {
    type: String,
    required: [true, 'Preferred language is required']
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other']
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
    }
  },
  specialRequirements: {
    dietary: [String],
    medical: [String],
    accessibility: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
familyMemberSchema.virtual('age').get(function() {
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

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

module.exports = FamilyMember;
