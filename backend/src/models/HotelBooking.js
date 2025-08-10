const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  hotelName: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  hotelChain: String,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'twin', 'triple', 'quad', 'suite', 'family'],
    required: true
  },
  roomCount: {
    type: Number,
    required: true,
    min: [1, 'At least 1 room is required']
  },
  guests: [{
    name: String,
    age: Number,
    gender: String,
    passportNumber: String,
    specialRequests: [String]
  }],
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'tv', 'minibar', 'room_service', 'gym', 'pool', 'spa', 'restaurant', 'parking', 'airport_shuttle']
  }],
  board: {
    type: String,
    enum: ['room_only', 'bed_and_breakfast', 'half_board', 'full_board', 'all_inclusive'],
    default: 'room_only'
  },
  pricing: {
    baseRate: Number,
    taxes: Number,
    fees: Number,
    totalAmount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    perNight: Number
  },
  payment: {
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date,
    deposit: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'pending'
  },
  cancellation: {
    isCancellable: {
      type: Boolean,
      default: true
    },
    cancellationPolicy: String,
    refundAmount: Number,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  specialRequests: [String],
  documents: {
    confirmation: String,
    voucher: String,
    receipt: String
  },
  reviews: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stay duration
hotelBookingSchema.virtual('stayDuration').get(function() {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for total cost per night
hotelBookingSchema.virtual('costPerNight').get(function() {
  if (this.pricing && this.pricing.totalAmount && this.stayDuration) {
    return this.pricing.totalAmount / this.stayDuration;
  }
  return null;
});

// Virtual for isUpcoming
hotelBookingSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.checkIn;
});

// Virtual for isActive
hotelBookingSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.checkIn <= now && now <= this.checkOut;
});

// Index for better query performance
hotelBookingSchema.index({ userId: 1, status: 1 });
hotelBookingSchema.index({ tripId: 1 });
hotelBookingSchema.index({ checkIn: 1, checkOut: 1 });
hotelBookingSchema.index({ 'location.city': 1 });

const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);

module.exports = HotelBooking;
