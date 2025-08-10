const express = require('express');
const router = express.Router();
const { authMiddleware, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const TransportBooking = require('../models/TransportBooking');
const HotelBooking = require('../models/HotelBooking');
const Trip = require('../models/Trip');

// Get payment history for a user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (type) query.bookingType = type;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Get payments from both transport and hotel bookings
  const [transportPayments, hotelPayments] = await Promise.all([
    TransportBooking.find({ userId: req.user.id })
      .select('totalPrice status paymentStatus paymentMethod createdAt')
      .populate('tripId', 'title destination'),
    HotelBooking.find({ userId: req.user.id })
      .select('totalPrice status paymentStatus paymentMethod createdAt')
      .populate('tripId', 'title destination')
  ]);

  // Transform to payment format
  const allPayments = [
    ...transportPayments.map(booking => ({
      id: booking._id,
      amount: booking.totalPrice,
      status: booking.paymentStatus,
      bookingType: 'transport',
      bookingStatus: booking.status,
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt,
      trip: booking.tripId
    })),
    ...hotelPayments.map(booking => ({
      id: booking._id,
      amount: booking.totalPrice,
      status: booking.paymentStatus,
      bookingType: 'hotel',
      bookingStatus: booking.status,
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt,
      trip: booking.tripId
    }))
  ];

  // Apply filters
  let filteredPayments = allPayments;
  if (status) {
    filteredPayments = filteredPayments.filter(payment => payment.status === status);
  }
  if (type) {
    filteredPayments = filteredPayments.filter(payment => payment.bookingType === type);
  }

  // Sort by creation date
  filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Apply pagination
  const total = filteredPayments.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  res.json({
    payments: paginatedPayments,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Get payment details by ID
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  // Check both transport and hotel bookings
  let booking = await TransportBooking.findById(req.params.id);
  let bookingType = 'transport';

  if (!booking) {
    booking = await HotelBooking.findById(req.params.id);
    bookingType = 'hotel';
  }

  if (!booking) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const paymentDetails = {
    id: booking._id,
    amount: booking.totalPrice,
    status: booking.paymentStatus,
    bookingType,
    bookingStatus: booking.status,
    paymentMethod: booking.paymentMethod,
    createdAt: booking.createdAt,
    trip: await (bookingType === 'transport' ? 
      TransportBooking.findById(req.params.id).populate('tripId', 'title destination') :
      HotelBooking.findById(req.params.id).populate('tripId', 'title destination')
    ).then(b => b.tripId)
  };

  res.json(paymentDetails);
}));

// Process payment for a booking
router.post('/process', authMiddleware, asyncHandler(async (req, res) => {
  const { bookingId, bookingType, paymentMethod, paymentDetails } = req.body;

  let booking;
  if (bookingType === 'transport') {
    booking = await TransportBooking.findById(bookingId);
  } else if (bookingType === 'hotel') {
    booking = await HotelBooking.findById(bookingId);
  } else {
    return res.status(400).json({ message: 'Invalid booking type' });
  }

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Payment already processed' });
  }

  // Mock payment processing - in real app, integrate with payment gateway
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update booking with payment details
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.paymentDetails = paymentDetails;
    booking.paidAt = new Date();
    
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }

    await booking.save();

    const populatedBooking = await (bookingType === 'transport' ? 
      TransportBooking.findById(bookingId).populate('tripId', 'title destination') :
      HotelBooking.findById(bookingId).populate('tripId', 'title destination')
    ).populate('userId', 'firstName lastName email');

    res.json({
      message: 'Payment processed successfully',
      booking: populatedBooking,
      payment: {
        id: booking._id,
        amount: booking.totalPrice,
        status: 'paid',
        method: paymentMethod,
        processedAt: booking.paidAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
}));

// Request refund for a booking
router.post('/:id/refund', authMiddleware, asyncHandler(async (req, res) => {
  const { refundReason } = req.body;
  
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

  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({ message: 'No payment to refund' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled' });
  }

  // Check if refund is within allowed time
  const now = new Date();
  let eventDate;
  
  if (bookingType === 'transport') {
    eventDate = new Date(booking.departureDate);
  } else {
    eventDate = new Date(booking.checkInDate);
  }

  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilEvent < 24) {
    return res.status(400).json({ 
      message: `Cannot request refund within 24 hours of ${bookingType === 'transport' ? 'departure' : 'check-in'}` 
    });
  }

  // Mock refund processing
  try {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.refundReason = refundReason;
    booking.refundedAt = new Date();
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    
    await booking.save();

    res.json({
      message: 'Refund request submitted successfully',
      refund: {
        id: booking._id,
        amount: booking.totalPrice,
        reason: refundReason,
        requestedAt: booking.refundedAt,
        status: 'processing'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Refund request failed', error: error.message });
  }
}));

// Get payment statistics
router.get('/stats/overview', authMiddleware, asyncHandler(async (req, res) => {
  const [transportStats, hotelStats] = await Promise.all([
    TransportBooking.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalPrice', 0] }
          },
          refundedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$totalPrice', 0] }
          },
          totalBookings: { $sum: 1 },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]),
    HotelBooking.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalPrice', 0] }
          },
          refundedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$totalPrice', 0] }
          },
          totalBookings: { $sum: 1 },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ])
  ]);

  const transportResult = transportStats[0] || {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalBookings: 0,
    paidBookings: 0,
    pendingBookings: 0
  };

  const hotelResult = hotelStats[0] || {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalBookings: 0,
    paidBookings: 0,
    pendingBookings: 0
  };

  const combinedStats = {
    totalAmount: transportResult.totalAmount + hotelResult.totalAmount,
    paidAmount: transportResult.paidAmount + hotelResult.paidAmount,
    pendingAmount: transportResult.pendingAmount + hotelResult.pendingAmount,
    refundedAmount: transportResult.refundedAmount + hotelResult.refundedAmount,
    totalBookings: transportResult.totalBookings + hotelResult.totalBookings,
    paidBookings: transportResult.paidBookings + hotelResult.paidBookings,
    pendingBookings: transportResult.pendingBookings + hotelResult.pendingBookings,
    transport: transportResult,
    hotel: hotelResult
  };

  res.json(combinedStats);
}));

// Get available payment methods
router.get('/methods/available', asyncHandler(async (req, res) => {
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Visa, MasterCard, American Express',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      description: 'Visa Debit, MasterCard Debit',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'PayPal account or credit card',
      icon: 'paypal',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: 'bank',
      enabled: false
    }
  ];

  res.json({ paymentMethods });
}));

module.exports = router;
