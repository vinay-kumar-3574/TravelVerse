const express = require('express');
const router = express.Router();
const { authMiddleware, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const TransportBooking = require('../models/TransportBooking');
const HotelBooking = require('../models/HotelBooking');
const Trip = require('../models/Trip');

// Get all bookings for a user (combined transport and hotel)
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status, upcoming } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (upcoming === 'true') {
    const now = new Date();
    if (type === 'transport') {
      query.departureDate = { $gte: now };
    } else if (type === 'hotel') {
      query.checkInDate = { $gte: now };
    } else {
      // For combined bookings, check both dates
      query.$or = [
        { departureDate: { $gte: now } },
        { checkInDate: { $gte: now } }
      ];
    }
  }

  let transportBookings = [];
  let hotelBookings = [];
  let total = 0;

  if (!type || type === 'transport') {
    const transportQuery = { ...query };
    if (type === 'transport') {
      delete transportQuery.$or;
      transportQuery.departureDate = { $gte: new Date() };
    }
    
    transportBookings = await TransportBooking.find(transportQuery)
      .populate('tripId', 'title destination')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ departureDate: 1 });
  }

  if (!type || type === 'hotel') {
    const hotelQuery = { ...query };
    if (type === 'hotel') {
      delete hotelQuery.$or;
      hotelQuery.checkInDate = { $gte: new Date() };
    }
    
    hotelBookings = await HotelBooking.find(hotelQuery)
      .populate('tripId', 'title destination')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ checkInDate: 1 });
  }

  // Combine and sort bookings by date
  const allBookings = [...transportBookings, ...hotelBookings]
    .sort((a, b) => {
      const dateA = a.departureDate || a.checkInDate;
      const dateB = b.departureDate || b.checkInDate;
      return new Date(dateA) - new Date(dateB);
    })
    .slice((page - 1) * limit, page * limit);

  // Get total count
  if (type === 'transport') {
    total = await TransportBooking.countDocuments(query);
  } else if (type === 'hotel') {
    total = await HotelBooking.countDocuments(query);
  } else {
    const transportCount = await TransportBooking.countDocuments({ userId: req.user.id });
    const hotelCount = await HotelBooking.countDocuments({ userId: req.user.id });
    total = transportCount + hotelCount;
  }

  res.json({
    bookings: allBookings,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Get booking by ID (works for both transport and hotel)
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  let booking = await TransportBooking.findById(req.params.id);
  let bookingType = 'transport';

  if (!booking) {
    booking = await HotelBooking.findById(req.params.id);
    bookingType = 'hotel';
  }

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const populatedBooking = await (bookingType === 'transport' ? 
    TransportBooking.findById(req.params.id).populate('tripId', 'title destination') :
    HotelBooking.findById(req.params.id).populate('tripId', 'title destination')
  ).populate('userId', 'firstName lastName email');

  res.json({ ...populatedBooking.toObject(), bookingType });
}));

// Cancel booking (works for both transport and hotel)
router.patch('/:id/cancel', authMiddleware, asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  
  let booking = await TransportBooking.findById(req.params.id);
  let bookingType = 'transport';

  if (!booking) {
    booking = await HotelBooking.findById(req.params.id);
    bookingType = 'hotel';
  }

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled' });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ message: 'Cannot cancel completed booking' });
  }

  // Check cancellation time limits
  const now = new Date();
  let hoursUntilEvent;

  if (bookingType === 'transport') {
    const departureDate = new Date(booking.departureDate);
    hoursUntilEvent = (departureDate - now) / (1000 * 60 * 60);
  } else {
    const checkInDate = new Date(booking.checkInDate);
    hoursUntilEvent = (checkInDate - now) / (1000 * 60 * 60);
  }

  if (hoursUntilEvent < 24) {
    return res.status(400).json({ 
      message: `Cannot cancel booking within 24 hours of ${bookingType === 'transport' ? 'departure' : 'check-in'}` 
    });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = cancellationReason;
  booking.cancelledAt = new Date();
  
  await booking.save();

  const populatedBooking = await (bookingType === 'transport' ? 
    TransportBooking.findById(booking._id).populate('tripId', 'title destination') :
    HotelBooking.findById(booking._id).populate('tripId', 'title destination')
  ).populate('userId', 'firstName lastName email');

  res.json({ ...populatedBooking.toObject(), bookingType });
}));

// Get booking statistics
router.get('/stats/overview', authMiddleware, asyncHandler(async (req, res) => {
  const [transportStats, hotelStats] = await Promise.all([
    TransportBooking.aggregate([
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
    ]),
    HotelBooking.aggregate([
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
    ])
  ]);

  const transportResult = transportStats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };

  const hotelResult = hotelStats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };

  const combinedStats = {
    totalBookings: transportResult.totalBookings + hotelResult.totalBookings,
    totalSpent: transportResult.totalSpent + hotelResult.totalSpent,
    confirmedBookings: transportResult.confirmedBookings + hotelResult.confirmedBookings,
    cancelledBookings: transportResult.cancelledBookings + hotelResult.cancelledBookings,
    completedBookings: transportResult.completedBookings + hotelResult.completedBookings,
    transport: transportResult,
    hotel: hotelResult
  };

  // Get upcoming bookings count
  const [upcomingTransport, upcomingHotel] = await Promise.all([
    TransportBooking.countDocuments({
      userId: req.user.id,
      departureDate: { $gte: new Date() },
      status: 'confirmed'
    }),
    HotelBooking.countDocuments({
      userId: req.user.id,
      checkInDate: { $gte: new Date() },
      status: 'confirmed'
    })
  ]);

  combinedStats.upcomingBookings = upcomingTransport + upcomingHotel;

  res.json(combinedStats);
}));

// Get recent bookings
router.get('/recent/list', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const [recentTransport, recentHotel] = await Promise.all([
    TransportBooking.find({ userId: req.user.id })
      .populate('tripId', 'title destination')
      .sort({ createdAt: -1 })
      .limit(limit),
    HotelBooking.find({ userId: req.user.id })
      .populate('tripId', 'title destination')
      .sort({ createdAt: -1 })
      .limit(limit)
  ]);

  // Combine and sort by creation date
  const allRecent = [...recentTransport, ...recentHotel]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(booking => ({
      ...booking.toObject(),
      bookingType: booking.departureDate ? 'transport' : 'hotel'
    }));

  res.json({ recentBookings: allRecent });
}));

module.exports = router;
