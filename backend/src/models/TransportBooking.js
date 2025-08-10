const mongoose = require('mongoose');

const transportBookingSchema = new mongoose.Schema({
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
  transportType: {
    type: String,
    enum: ['flight', 'train', 'bus'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  // Flight specific fields
  flight: {
    airline: String,
    flightNumber: String,
    aircraft: String,
    departureAirport: String,
    arrivalAirport: String,
    departureTime: Date,
    arrivalTime: Date,
    class: {
      type: String,
      enum: ['economy', 'premium_economy', 'business', 'first']
    },
    stops: {
      type: Number,
      default: 0
    },
    baggage: {
      checked: Number,
      carryOn: Number
    },
    meal: Boolean,
    entertainment: Boolean
  },
  // Train specific fields
  train: {
    trainNumber: String,
    trainName: String,
    departureStation: String,
    arrivalStation: String,
    departureTime: Date,
    arrivalTime: Date,
    class: {
      type: String,
      enum: ['sleeper', '3ac', '2ac', '1ac', 'cc', 'ec']
    },
    coach: String,
    seatNumber: String,
    berth: String
  },
  // Bus specific fields
  bus: {
    busNumber: String,
    operator: String,
    departureTerminal: String,
    arrivalTerminal: String,
    departureTime: Date,
    arrivalTime: Date,
    class: {
      type: String,
      enum: ['sleeper', 'seater', 'ac', 'non_ac']
    },
    seatNumber: String
  },
  // Common fields
  passengers: [{
    name: String,
    age: Number,
    gender: String,
    seatNumber: String,
    passportNumber: String,
    specialRequests: [String]
  }],
  pricing: {
    baseFare: Number,
    taxes: Number,
    fees: Number,
    totalAmount: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
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
  documents: {
    ticket: String,
    boardingPass: String,
    receipt: String
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

// Virtual for journey duration
transportBookingSchema.virtual('journeyDuration').get(function() {
  let departureTime, arrivalTime;
  
  if (this.transportType === 'flight' && this.flight) {
    departureTime = this.flight.departureTime;
    arrivalTime = this.flight.arrivalTime;
  } else if (this.transportType === 'train' && this.train) {
    departureTime = this.train.departureTime;
    arrivalTime = this.train.arrivalTime;
  } else if (this.transportType === 'bus' && this.bus) {
    departureTime = this.bus.departureTime;
    arrivalTime = this.bus.arrivalTime;
  }
  
  if (departureTime && arrivalTime) {
    const diffTime = Math.abs(arrivalTime - departureTime);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  }
  return null;
});

// Virtual for isUpcoming
transportBookingSchema.virtual('isUpcoming').get(function() {
  let departureTime;
  
  if (this.transportType === 'flight' && this.flight) {
    departureTime = this.flight.departureTime;
  } else if (this.transportType === 'train' && this.train) {
    departureTime = this.train.departureTime;
  } else if (this.transportType === 'bus' && this.bus) {
    departureTime = this.bus.departureTime;
  }
  
  if (departureTime) {
    return new Date() < departureTime;
  }
  return false;
});

// Index for better query performance
transportBookingSchema.index({ userId: 1, status: 1 });
transportBookingSchema.index({ tripId: 1 });
transportBookingSchema.index({ transportType: 1, status: 1 });

const TransportBooking = mongoose.model('TransportBooking', transportBookingSchema);

module.exports = TransportBooking;
