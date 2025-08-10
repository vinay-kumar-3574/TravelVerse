const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const Trip = require('../models/Trip');
const TransportBooking = require('../models/TransportBooking');
const HotelBooking = require('../models/HotelBooking');
const FamilyMember = require('../models/FamilyMember');

// Get comprehensive dashboard overview
router.get('/overview', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all statistics in parallel
  const [
    userStats,
    tripStats,
    transportStats,
    hotelStats,
    familyStats,
    upcomingTrips,
    recentActivity
  ] = await Promise.all([
    // User statistics
    User.findById(userId).select('firstName lastName email preferences createdAt'),
    
    // Trip statistics
    Trip.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          upcomingTrips: { $sum: { $cond: [{ $gte: ['$startDate', new Date()] }, 1, 0] } },
          totalBudget: { $sum: '$budget' },
          totalExpenses: { $sum: '$totalExpenses' },
          averageTripDuration: { $avg: '$duration' }
        }
      }
    ]),

    // Transport statistics
    TransportBooking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          upcomingBookings: { $sum: { $cond: [{ $gte: ['$departureDate', new Date()] }, 1, 0] } },
          totalSpent: { $sum: '$totalPrice' },
          averagePrice: { $avg: '$totalPrice' }
        }
      }
    ]),

    // Hotel statistics
    HotelBooking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          upcomingBookings: { $sum: { $cond: [{ $gte: ['$checkInDate', new Date()] }, 1, 0] } },
          totalSpent: { $sum: '$totalPrice' },
          averagePrice: { $avg: '$totalPrice' },
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
    ]),

    // Family member statistics
    FamilyMember.countDocuments({ userId }),

    // Upcoming trips with details
    Trip.find({ 
      userId, 
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    })
    .select('title destination startDate endDate status budget')
    .sort({ startDate: 1 })
    .limit(5),

    // Recent activity (last 10 activities)
    Promise.all([
      TransportBooking.find({ userId })
        .select('transportType from to departureDate status createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      HotelBooking.find({ userId })
        .select('hotelName location checkInDate status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ])
  ]);

  // Process statistics
  const tripResult = tripStats[0] || {
    totalTrips: 0,
    completedTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    totalExpenses: 0,
    averageTripDuration: 0
  };

  const transportResult = transportStats[0] || {
    totalBookings: 0,
    confirmedBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    averagePrice: 0
  };

  const hotelResult = hotelStats[0] || {
    totalBookings: 0,
    confirmedBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    averagePrice: 0,
    totalNights: 0
  };

  // Combine recent activities
  const [recentTransport, recentHotel] = recentActivity;
  const allRecentActivity = [...recentTransport, ...recentHotel]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(activity => ({
      ...activity.toObject(),
      type: activity.departureDate ? 'transport' : 'hotel',
      date: activity.departureDate || activity.checkInDate
    }));

  const dashboardData = {
    user: userStats,
    overview: {
      totalTrips: tripResult.totalTrips,
      totalBookings: transportResult.totalBookings + hotelResult.totalBookings,
      totalSpent: transportResult.totalSpent + hotelResult.totalSpent,
      familyMembers: familyStats,
      memberSince: userStats.createdAt
    },
    trips: {
      total: tripResult.totalTrips,
      completed: tripResult.completedTrips,
      upcoming: tripResult.upcomingTrips,
      totalBudget: tripResult.totalBudget,
      totalExpenses: tripResult.totalExpenses,
      averageDuration: Math.round(tripResult.averageTripDuration || 0),
      budgetUtilization: tripResult.totalBudget > 0 ? 
        Math.round((tripResult.totalExpenses / tripResult.totalBudget) * 100) : 0
    },
    transport: {
      total: transportResult.totalBookings,
      confirmed: transportResult.confirmedBookings,
      upcoming: transportResult.upcomingBookings,
      totalSpent: transportResult.totalSpent,
      averagePrice: Math.round(transportResult.averagePrice || 0)
    },
    hotels: {
      total: hotelResult.totalBookings,
      confirmed: hotelResult.confirmedBookings,
      upcoming: hotelResult.upcomingBookings,
      totalSpent: hotelResult.totalSpent,
      averagePrice: Math.round(hotelResult.averagePrice || 0),
      totalNights: Math.round(hotelResult.totalNights || 0)
    },
    upcomingTrips,
    recentActivity: allRecentActivity
  };

  res.json(dashboardData);
}));

// Get dashboard charts data
router.get('/charts', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = '6months' } = req.query;

  let dateFilter;
  const now = new Date();
  
  switch (period) {
    case '1month':
      dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3months':
      dateFilter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6months':
      dateFilter = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case '1year':
      dateFilter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      dateFilter = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }

  // Get monthly spending data
  const monthlySpending = await Promise.all([
    TransportBooking.aggregate([
      { $match: { userId, createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    HotelBooking.aggregate([
      { $match: { userId, createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  // Get destination statistics
  const destinationStats = await Trip.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$destination',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        totalExpenses: { $sum: '$totalExpenses' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get transport type distribution
  const transportTypeStats = await TransportBooking.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$transportType',
        count: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get booking status distribution
  const [transportStatusStats, hotelStatusStats] = await Promise.all([
    TransportBooking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    HotelBooking.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Combine status stats
  const combinedStatusStats = {};
  [...transportStatusStats, ...hotelStatusStats].forEach(stat => {
    if (combinedStatusStats[stat._id]) {
      combinedStatusStats[stat._id] += stat.count;
    } else {
      combinedStatusStats[stat._id] = stat.count;
    }
  });

  const chartsData = {
    monthlySpending: {
      transport: monthlySpending[0],
      hotels: monthlySpending[1]
    },
    destinations: destinationStats,
    transportTypes: transportTypeStats,
    bookingStatus: Object.entries(combinedStatusStats).map(([status, count]) => ({
      status,
      count
    })),
    period
  };

  res.json(chartsData);
}));

// Get quick actions data
router.get('/quick-actions', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const quickActions = [
    {
      id: 'create-trip',
      title: 'Create New Trip',
      description: 'Plan your next adventure',
      icon: 'plus-circle',
      action: 'navigate',
      route: '/trips/create',
      enabled: true
    },
    {
      id: 'book-transport',
      title: 'Book Transport',
      description: 'Find flights, trains, or buses',
      icon: 'plane',
      action: 'navigate',
      route: '/transport/search',
      enabled: true
    },
    {
      id: 'book-hotel',
      title: 'Book Hotel',
      description: 'Find accommodation',
      icon: 'bed',
      action: 'navigate',
      route: '/hotels/search',
      enabled: true
    },
    {
      id: 'view-bookings',
      title: 'View Bookings',
      description: 'Check your reservations',
      icon: 'calendar',
      action: 'navigate',
      route: '/bookings',
      enabled: true
    },
    {
      id: 'manage-profile',
      title: 'Update Profile',
      description: 'Edit your information',
      icon: 'user',
      action: 'navigate',
      route: '/profile',
      enabled: true
    }
  ];

  // Check if user has any upcoming trips to enable trip-related actions
  const upcomingTrips = await Trip.countDocuments({
    userId,
    startDate: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  });

  if (upcomingTrips === 0) {
    quickActions.find(action => action.id === 'create-trip').description = 'Start planning your first trip!';
  }

  res.json({ quickActions });
}));

// Get notifications and alerts
router.get('/notifications', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const notifications = [];

  // Check for upcoming trips (within 7 days)
  const upcomingTrips = await Trip.find({
    userId,
    startDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    status: { $ne: 'cancelled' }
  });

  upcomingTrips.forEach(trip => {
    const daysUntil = Math.ceil((trip.startDate - now) / (1000 * 60 * 60 * 24));
    notifications.push({
      id: `trip-${trip._id}`,
      type: 'trip',
      title: 'Upcoming Trip',
      message: `Your trip to ${trip.destination} starts in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
      priority: daysUntil <= 1 ? 'high' : 'medium',
      date: trip.startDate,
      action: 'view-trip',
      data: { tripId: trip._id }
    });
  });

  // Check for pending payments
  const pendingPayments = await Promise.all([
    TransportBooking.countDocuments({ userId, paymentStatus: 'pending' }),
    HotelBooking.countDocuments({ userId, paymentStatus: 'pending' })
  ]);

  const totalPending = pendingPayments[0] + pendingPayments[1];
  if (totalPending > 0) {
    notifications.push({
      id: 'pending-payments',
      type: 'payment',
      title: 'Pending Payments',
      message: `You have ${totalPending} booking${totalPending > 1 ? 's' : ''} with pending payments`,
      priority: 'high',
      date: now,
      action: 'view-payments',
      data: { type: 'pending' }
    });
  }

  // Check for cancelled bookings
  const recentCancellations = await Promise.all([
    TransportBooking.find({
      userId,
      status: 'cancelled',
      cancelledAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    }).count(),
    HotelBooking.find({
      userId,
      status: 'cancelled',
      cancelledAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    }).count()
  ]);

  const totalCancelled = recentCancellations[0] + recentCancellations[1];
  if (totalCancelled > 0) {
    notifications.push({
      id: 'recent-cancellations',
      type: 'booking',
      title: 'Recent Cancellations',
      message: `You have ${totalCancelled} recently cancelled booking${totalCancelled > 1 ? 's' : ''}`,
      priority: 'medium',
      date: now,
      action: 'view-bookings',
      data: { status: 'cancelled' }
    });
  }

  // Sort notifications by priority and date
  notifications.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.date) - new Date(a.date);
  });

  res.json({ notifications });
}));

module.exports = router;
