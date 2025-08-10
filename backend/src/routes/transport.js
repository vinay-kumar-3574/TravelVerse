const express = require('express');
const router = express.Router();
const { authMiddleware, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const TransportBooking = require('../models/TransportBooking');

// Get all transport bookings for a user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type, upcoming } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (type) query.transportType = type;
  if (upcoming === 'true') {
    query.departureDate = { $gte: new Date() };
  }

  const bookings = await TransportBooking.find(query)
    .populate('tripId', 'title destination')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ departureDate: 1 });

  const total = await TransportBooking.countDocuments(query);

  res.json({
    bookings,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Get transport booking by ID
router.get('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const booking = await TransportBooking.findById(req.params.id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');
  
  if (!booking) {
    return res.status(404).json({ message: 'Transport booking not found' });
  }

  res.json(booking);
}));

// Create new transport booking
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const transportBooking = new TransportBooking({
    ...req.body,
    userId: req.user.id
  });
  
  await transportBooking.save();
  
  const populatedBooking = await TransportBooking.findById(transportBooking._id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');

  res.status(201).json(populatedBooking);
}));

// Update transport booking
router.put('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const { status, ...updateData } = req.body;
  
  // Only allow status updates for confirmed bookings
  if (status && status !== 'cancelled') {
    updateData.status = status;
  }

  const booking = await TransportBooking.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('tripId', 'title destination')
   .populate('userId', 'firstName lastName email');

  res.json(booking);
}));

// Cancel transport booking
router.patch('/:id/cancel', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  
  const booking = await TransportBooking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Transport booking not found' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled' });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ message: 'Cannot cancel completed booking' });
  }

  // Check if cancellation is within allowed time
  const departureDate = new Date(booking.departureDate);
  const now = new Date();
  const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);

  if (hoursUntilDeparture < 24) {
    return res.status(400).json({ message: 'Cannot cancel booking within 24 hours of departure' });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = cancellationReason;
  booking.cancelledAt = new Date();
  
  await booking.save();

  const populatedBooking = await TransportBooking.findById(booking._id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');

  res.json(populatedBooking);
}));

// Delete transport booking (only if not confirmed)
router.delete('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const booking = await TransportBooking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Transport booking not found' });
  }

  if (['confirmed', 'completed'].includes(booking.status)) {
    return res.status(400).json({ message: 'Cannot delete confirmed or completed booking' });
  }

  await TransportBooking.findByIdAndDelete(req.params.id);
  res.json({ message: 'Transport booking deleted successfully' });
}));

// Search transport options (mock implementation - would integrate with real APIs)
router.get('/search/options', authMiddleware, asyncHandler(async (req, res) => {
  const { from, to, date, passengers, type } = req.query;
  
  // This would typically integrate with external transport APIs
  // For now, returning mock data structure
  const mockOptions = [
    {
      id: '1',
      transportType: type || 'flight',
      from,
      to,
      departureDate: date,
      arrivalDate: date, // Would calculate based on duration
      duration: '2h 30m',
      price: 150 * (passengers || 1),
      availableSeats: 50,
      operator: 'Mock Airlines',
      stops: 0
    }
  ];

  res.json({
    options: mockOptions,
    searchParams: { from, to, date, passengers, type }
  });
}));

// Get transport statistics
router.get('/stats/overview', authMiddleware, asyncHandler(async (req, res) => {
  const stats = await TransportBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  const upcomingBookings = await TransportBooking.countDocuments({
    userId: req.user.id,
    departureDate: { $gte: new Date() },
    status: 'confirmed'
  });

  const result = stats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };

  result.upcomingBookings = upcomingBookings;

  res.json(result);
}));

module.exports = router;
