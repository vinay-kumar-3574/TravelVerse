const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [200, 'Trip title cannot exceed 200 characters']
  },
  source: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1000, 'Budget must be at least ₹1,000']
  },
  members: {
    type: Number,
    required: [true, 'Number of members is required'],
    min: [1, 'At least 1 member is required'],
    max: [20, 'Maximum 20 members allowed']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  status: {
    type: String,
    enum: ['planning', 'booked', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  transportBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportBooking'
  },
  hotelBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelBooking'
  },
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      activity: String,
      location: String,
      description: String,
      cost: Number
    }]
  }],
  expenses: [{
    category: {
      type: String,
      enum: ['transport', 'accommodation', 'food', 'activities', 'shopping', 'other']
    },
    description: String,
    amount: Number,
    date: Date,
    receipt: String
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  weatherInfo: {
    temperature: Number,
    condition: String,
    humidity: Number,
    lastUpdated: Date
  },
  localCurrency: {
    code: String,
    symbol: String,
    exchangeRate: Number
  },
  emergencyContacts: [{
    name: String,
    contact: String,
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  if (this.departureDate && this.returnDate) {
    const diffTime = Math.abs(this.returnDate - this.departureDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for total expenses
tripSchema.virtual('totalExpenses').get(function() {
  if (this.expenses && this.expenses.length > 0) {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }
  return 0;
});

// Virtual for budget remaining
tripSchema.virtual('budgetRemaining').get(function() {
  return this.budget - this.totalExpenses;
});

// Virtual for budget percentage used
tripSchema.virtual('budgetPercentageUsed').get(function() {
  if (this.budget > 0) {
    return (this.totalExpenses / this.budget) * 100;
  }
  return 0;
});

// Index for better query performance
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ departureDate: 1 });
tripSchema.index({ source: 1, destination: 1 });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
