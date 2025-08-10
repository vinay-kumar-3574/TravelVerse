const TransportBooking = require('../models/TransportBooking');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all transport bookings for a user
const getAllTransportBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (type) query.transportType = type;
  if (search) {
    query.$or = [
      { source: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
      { bookingReference: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await TransportBooking.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOptions);

  const total = await TransportBooking.countDocuments(query);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// Get single transport booking
const getTransportBooking = asyncHandler(async (req, res) => {
  const booking = await TransportBooking.findOne({ 
    _id: req.params.id, 
    userId: req.user.id 
  });

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transport booking not found' 
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// Create new transport booking
const createTransportBooking = asyncHandler(async (req, res) => {
  const bookingData = {
    ...req.body,
    userId: req.user.id
  };

  const booking = await TransportBooking.create(bookingData);
  
  res.status(201).json({
    success: true,
    message: 'Transport booking created successfully',
    data: booking
  });
});

// Update transport booking
const updateTransportBooking = asyncHandler(async (req, res) => {
  const booking = await TransportBooking.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transport booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Transport booking updated successfully',
    data: booking
  });
});

// Delete transport booking
const deleteTransportBooking = asyncHandler(async (req, res) => {
  const booking = await TransportBooking.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transport booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Transport booking deleted successfully'
  });
});

// Cancel transport booking
const cancelTransportBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const booking = await TransportBooking.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { 
      status: 'cancelled',
      cancellationDetails: {
        reason: reason || 'Cancelled by user',
        cancelledAt: new Date(),
        cancelledBy: req.user.id
      }
    },
    { new: true, runValidators: true }
  );

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transport booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Transport booking cancelled successfully',
    data: booking
  });
});

// Search transport options (mock implementation)
const searchTransportOptions = asyncHandler(async (req, res) => {
  const { source, destination, date, passengers, type, budget } = req.query;
  
  // Mock transport options based on search criteria
  const mockOptions = generateMockTransportOptions(source, destination, date, passengers, type, budget);

  res.json({
    success: true,
    data: {
      searchCriteria: { source, destination, date, passengers, type, budget },
      options: mockOptions,
      totalResults: mockOptions.length
    }
  });
});

// Get transport statistics
const getTransportStats = asyncHandler(async (req, res) => {
  const stats = await TransportBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' },
        bookingsByType: {
          $push: {
            type: '$transportType',
            amount: '$totalAmount'
          }
        },
        bookingsByStatus: {
          $push: {
            status: '$status',
            amount: '$totalAmount'
          }
        }
      }
    }
  ]);

  const typeBreakdown = await TransportBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$transportType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    }
  ]);

  const statusBreakdown = await TransportBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const response = {
    success: true,
    data: {
      overview: stats[0] || {
        totalBookings: 0,
        totalSpent: 0,
        avgAmount: 0
      },
      typeBreakdown,
      statusBreakdown,
      recentBookings: await TransportBooking.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('transportType source destination status totalAmount createdAt')
    }
  };

  res.json(response);
});

// Helper function to generate mock transport options
const generateMockTransportOptions = (source, destination, date, passengers, type, budget) => {
  const options = [];
  const types = type ? [type] : ['flight', 'train', 'bus'];
  
  types.forEach(transportType => {
    if (transportType === 'flight') {
      options.push({
        id: `flight_${Math.random().toString(36).substr(2, 9)}`,
        transportType: 'flight',
        source,
        destination,
        departureTime: new Date(date),
        arrivalTime: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        duration: '2h 15m',
        price: Math.floor(Math.random() * 5000) + 2000,
        airline: ['Air India', 'IndiGo', 'SpiceJet', 'Vistara'][Math.floor(Math.random() * 4)],
        flightNumber: `${Math.random().toString(36).substr(2, 2).toUpperCase()}${Math.floor(Math.random() * 9999)}`,
        availableSeats: Math.floor(Math.random() * 50) + 10
      });
    } else if (transportType === 'train') {
      options.push({
        id: `train_${Math.random().toString(36).substr(2, 9)}`,
        transportType: 'train',
        source,
        destination,
        departureTime: new Date(date),
        arrivalTime: new Date(new Date(date).getTime() + 8 * 60 * 60 * 1000), // 8 hours later
        duration: '8h 30m',
        price: Math.floor(Math.random() * 1000) + 500,
        trainNumber: `${Math.floor(Math.random() * 99999)}`,
        trainName: ['Rajdhani Express', 'Shatabdi Express', 'Duronto Express'][Math.floor(Math.random() * 3)],
        availableSeats: Math.floor(Math.random() * 100) + 20
      });
    } else if (transportType === 'bus') {
      options.push({
        id: `bus_${Math.random().toString(36).substr(2, 9)}`,
        transportType: 'bus',
        source,
        destination,
        departureTime: new Date(date),
        arrivalTime: new Date(new Date(date).getTime() + 6 * 60 * 60 * 1000), // 6 hours later
        duration: '6h 45m',
        price: Math.floor(Math.random() * 500) + 200,
        busOperator: ['RedBus', 'GoBus', 'Orange Tours'][Math.floor(Math.random() * 3)],
        busType: ['AC Sleeper', 'Non-AC', 'Luxury'][Math.floor(Math.random() * 3)],
        availableSeats: Math.floor(Math.random() * 30) + 5
      });
    }
  });

  // Filter by budget if specified
  if (budget) {
    return options.filter(option => option.price <= budget);
  }

  return options;
};

module.exports = {
  getAllTransportBookings,
  getTransportBooking,
  createTransportBooking,
  updateTransportBooking,
  deleteTransportBooking,
  cancelTransportBooking,
  searchTransportOptions,
  getTransportStats
};
