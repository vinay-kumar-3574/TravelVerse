const express = require('express');
const router = express.Router();
const { authMiddleware, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const HotelBooking = require('../models/HotelBooking');

// Get all hotel bookings for a user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, upcoming } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (upcoming === 'true') {
    query.checkInDate = { $gte: new Date() };
  }

  const bookings = await HotelBooking.find(query)
    .populate('tripId', 'title destination')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ checkInDate: 1 });

  const total = await HotelBooking.countDocuments(query);

  res.json({
    bookings,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Get hotel booking by ID
router.get('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findById(req.params.id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');
  
  if (!booking) {
    return res.status(404).json({ message: 'Hotel booking not found' });
  }

  res.json(booking);
}));

// Create new hotel booking
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const hotelBooking = new HotelBooking({
    ...req.body,
    userId: req.user.id
  });
  
  await hotelBooking.save();
  
  const populatedBooking = await HotelBooking.findById(hotelBooking._id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');

  res.status(201).json(populatedBooking);
}));

// Update hotel booking
router.put('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const { status, ...updateData } = req.body;
  
  // Only allow status updates for confirmed bookings
  if (status && status !== 'cancelled') {
    updateData.status = status;
  }

  const booking = await HotelBooking.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('tripId', 'title destination')
   .populate('userId', 'firstName lastName email');

  res.json(booking);
}));

// Cancel hotel booking
router.patch('/:id/cancel', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  
  const booking = await HotelBooking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Hotel booking not found' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled' });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ message: 'Cannot cancel completed booking' });
  }

  // Check if cancellation is within allowed time
  const checkInDate = new Date(booking.checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < 24) {
    return res.status(400).json({ message: 'Cannot cancel booking within 24 hours of check-in' });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = cancellationReason;
  booking.cancelledAt = new Date();
  
  await booking.save();

  const populatedBooking = await HotelBooking.findById(booking._id)
    .populate('tripId', 'title destination')
    .populate('userId', 'firstName lastName email');

  res.json(populatedBooking);
}));

// Delete hotel booking (only if not confirmed)
router.delete('/:id', authMiddleware, checkOwnership, asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Hotel booking not found' });
  }

  if (['confirmed', 'completed'].includes(booking.status)) {
    return res.status(400).json({ message: 'Cannot delete confirmed or completed booking' });
  }

  await HotelBooking.findByIdAndDelete(req.params.id);
  res.json({ message: 'Hotel booking deleted successfully' });
}));

// Search hotel options (mock implementation - would integrate with real APIs)
router.get('/search/options', authMiddleware, asyncHandler(async (req, res) => {
  const { location, checkIn, checkOut, guests, rooms, amenities } = req.query;
  
  // This would typically integrate with external hotel APIs
  // For now, returning mock data structure
  const mockOptions = [
    {
      id: '1',
      hotelName: 'Mock Luxury Hotel',
      location,
      checkIn,
      checkOut,
      guests: parseInt(guests) || 2,
      rooms: parseInt(rooms) || 1,
      amenities: amenities ? amenities.split(',') : ['WiFi', 'Pool', 'Gym'],
      pricePerNight: 200,
      totalPrice: 200 * (parseInt(checkOut) - parseInt(checkIn)),
      rating: 4.5,
      images: ['https://example.com/hotel1.jpg'],
      available: true
    }
  ];

  res.json({
    options: mockOptions,
    searchParams: { location, checkIn, checkOut, guests, rooms, amenities }
  });
}));

// Get hotel statistics
router.get('/stats/overview', authMiddleware, asyncHandler(async (req, res) => {
  const stats = await HotelBooking.aggregate([
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
        },
        totalNights: {
          $sum: {
            $divide: [
              { $subtract: ['$checkOutDate', '$checkInDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);

  const upcomingBookings = await HotelBooking.countDocuments({
    userId: req.user.id,
    checkInDate: { $gte: new Date() },
    status: 'confirmed'
  });

  const result = stats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalNights: 0
  };

  result.upcomingBookings = upcomingBookings;

  res.json(result);
}));

// Get hotel amenities list
router.get('/amenities/list', asyncHandler(async (req, res) => {
  const amenities = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service',
    'Laundry', 'Parking', 'Shuttle', 'Business Center', 'Conference Room',
    'Pet Friendly', 'Accessibility', 'Air Conditioning', 'Heating',
    'Kitchen', 'Balcony', 'Ocean View', 'Mountain View', 'City View'
  ];

  res.json({ amenities });
}));

module.exports = router;
