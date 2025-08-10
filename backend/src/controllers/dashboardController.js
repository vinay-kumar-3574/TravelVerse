const User = require('../models/User');
const Trip = require('../models/Trip');
const TransportBooking = require('../models/TransportBooking');
const HotelBooking = require('../models/HotelBooking');
const { asyncHandler } = require('../middleware/errorHandler');

// Get dashboard overview
const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user stats
  const userStats = await User.findById(userId).select('firstName lastName email createdAt');
  
  // Get trip stats
  const tripStats = await Trip.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        totalExpenses: { $sum: { $sum: '$expenses.amount' } },
        avgBudget: { $avg: '$budget' },
        activeTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        upcomingTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', 'planning'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get transport stats
  const transportStats = await TransportBooking.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' },
        upcomingBookings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get hotel stats
  const hotelStats = await HotelBooking.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' },
        upcomingBookings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get recent activities
  const recentTrips = await Trip.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title source destination status budget createdAt');

  const recentTransportBookings = await TransportBooking.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('transportType source destination status totalAmount createdAt');

  const recentHotelBookings = await HotelBooking.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('hotelName destination status totalAmount checkIn checkOut createdAt');

  const overview = {
    user: userStats,
    trips: tripStats[0] || {
      totalTrips: 0,
      totalBudget: 0,
      totalExpenses: 0,
      avgBudget: 0,
      activeTrips: 0,
      upcomingTrips: 0
    },
    transport: transportStats[0] || {
      totalBookings: 0,
      totalSpent: 0,
      avgAmount: 0,
      upcomingBookings: 0
    },
    hotels: hotelStats[0] || {
      totalBookings: 0,
      totalSpent: 0,
      avgAmount: 0,
      upcomingBookings: 0
    },
    recentActivities: {
      trips: recentTrips,
      transport: recentTransportBookings,
      hotels: recentHotelBookings
    }
  };

  res.json({
    success: true,
    data: overview
  });
});

// Get chart data
const getChartData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, period = 'monthly' } = req.query;

  let chartData = {};

  if (type === 'spending' || !type) {
    // Monthly spending chart
    const spendingData = await getMonthlySpendingData(userId, period);
    chartData.spending = spendingData;
  }

  if (type === 'destinations' || !type) {
    // Popular destinations chart
    const destinationsData = await getPopularDestinationsData(userId);
    chartData.destinations = destinationsData;
  }

  if (type === 'transport' || !type) {
    // Transport type breakdown
    const transportData = await getTransportTypeData(userId);
    chartData.transport = transportData;
  }

  if (type === 'hotels' || !type) {
    // Hotel ratings and spending
    const hotelData = await getHotelRatingData(userId);
    chartData.hotels = hotelData;
  }

  res.json({
    success: true,
    data: chartData
  });
});

// Get quick actions
const getQuickActions = asyncHandler(async (req, res) => {
  const quickActions = [
    {
      id: 'new_trip',
      title: 'Plan New Trip',
      description: 'Start planning your next adventure',
      icon: 'map',
      action: 'navigate',
      route: '/trip/new',
      color: 'blue'
    },
    {
      id: 'book_transport',
      title: 'Book Transport',
      description: 'Find and book flights, trains, or buses',
      icon: 'plane',
      action: 'navigate',
      route: '/transport',
      color: 'green'
    },
    {
      id: 'book_hotel',
      title: 'Book Hotel',
      description: 'Find and book accommodation',
      icon: 'bed',
      action: 'navigate',
      route: '/hotels',
      color: 'purple'
    },
    {
      id: 'budget_planner',
      title: 'Budget Planner',
      description: 'Plan and track your travel expenses',
      icon: 'calculator',
      action: 'navigate',
      route: '/dashboard/budget',
      color: 'orange'
    },
    {
      id: 'travel_documents',
      title: 'Travel Documents',
      description: 'Manage your travel documents',
      icon: 'file-text',
      action: 'navigate',
      route: '/documents',
      color: 'red'
    },
    {
      id: 'emergency_contacts',
      title: 'Emergency Contacts',
      description: 'Update emergency contact information',
      icon: 'phone',
      action: 'navigate',
      route: '/emergency-contacts',
      color: 'yellow'
    }
  ];

  res.json({
    success: true,
    data: quickActions
  });
});

// Get notifications and alerts
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notifications = [];

  // Check for upcoming trips
  const upcomingTrips = await Trip.find({
    userId,
    status: 'planning',
    departureDate: { $gte: new Date() }
  }).sort({ departureDate: 1 });

  upcomingTrips.forEach(trip => {
    const daysUntilTrip = Math.ceil((new Date(trip.departureDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTrip <= 7) {
      notifications.push({
        id: `trip_${trip._id}`,
        type: 'warning',
        title: 'Upcoming Trip',
        message: `Your trip to ${trip.destination} is in ${daysUntilTrip} day${daysUntilTrip === 1 ? '' : 's'}`,
        timestamp: new Date(),
        action: 'view_trip',
        data: { tripId: trip._id }
      });
    }
  });

  // Check for upcoming transport bookings
  const upcomingTransport = await TransportBooking.find({
    userId,
    status: 'confirmed',
    departureTime: { $gte: new Date() }
  }).sort({ departureTime: 1 });

  upcomingTransport.forEach(booking => {
    const hoursUntilDeparture = Math.ceil((new Date(booking.departureTime) - new Date()) / (1000 * 60 * 60));
    
    if (hoursUntilDeparture <= 24) {
      notifications.push({
        id: `transport_${booking._id}`,
        type: 'info',
        title: 'Transport Reminder',
        message: `Your ${booking.transportType} to ${booking.destination} departs in ${hoursUntilDeparture} hour${hoursUntilDeparture === 1 ? '' : 's'}`,
        timestamp: new Date(),
        action: 'view_booking',
        data: { bookingId: booking._id, type: 'transport' }
      });
    }
  });

  // Check for upcoming hotel bookings
  const upcomingHotels = await HotelBooking.find({
    userId,
    status: 'confirmed',
    checkIn: { $gte: new Date() }
  }).sort({ checkIn: 1 });

  upcomingHotels.forEach(booking => {
    const daysUntilCheckIn = Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilCheckIn <= 3) {
      notifications.push({
        id: `hotel_${booking._id}`,
        type: 'info',
        title: 'Hotel Check-in Reminder',
        message: `Check-in at ${booking.hotelName} in ${daysUntilCheckIn} day${daysUntilCheckIn === 1 ? '' : 's'}`,
        timestamp: new Date(),
        action: 'view_booking',
        data: { bookingId: booking._id, type: 'hotel' }
      });
    }
  });

  // Sort notifications by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount: notifications.length
    }
  });
});

// Helper function to get monthly spending data
const getMonthlySpendingData = async (userId, period) => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      date: date
    });
  }

  const spendingData = await Promise.all(months.map(async (month) => {
    const startDate = new Date(month.date);
    const endDate = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0);

    const [transportSpending, hotelSpending, tripExpenses] = await Promise.all([
      TransportBooking.aggregate([
        { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      HotelBooking.aggregate([
        { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Trip.aggregate([
        { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: { $sum: '$expenses.amount' } } } }
      ])
    ]);

    return {
      month: month.month,
      year: month.year,
      transport: transportSpending[0]?.total || 0,
      hotels: hotelSpending[0]?.total || 0,
      expenses: tripExpenses[0]?.total || 0,
      total: (transportSpending[0]?.total || 0) + (hotelSpending[0]?.total || 0) + (tripExpenses[0]?.total || 0)
    };
  }));

  return spendingData;
};

// Helper function to get popular destinations data
const getPopularDestinationsData = async (userId) => {
  const destinations = await Trip.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$destination',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return destinations;
};

// Helper function to get transport type data
const getTransportTypeData = async (userId) => {
  const transportData = await TransportBooking.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$transportType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return transportData;
};

// Helper function to get hotel rating data
const getHotelRatingData = async (userId) => {
  const hotelData = await HotelBooking.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$hotelRating',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  return hotelData;
};

module.exports = {
  getDashboardOverview,
  getChartData,
  getQuickActions,
  getNotifications
};
