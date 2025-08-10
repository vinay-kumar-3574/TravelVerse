const HotelBooking = require('../models/HotelBooking');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all hotel bookings for a user
const getAllHotelBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { hotelName: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
      { bookingReference: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await HotelBooking.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOptions);

  const total = await HotelBooking.countDocuments(query);

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

// Get single hotel booking
const getHotelBooking = asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findOne({ 
    _id: req.params.id, 
    userId: req.user.id 
  });

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Hotel booking not found' 
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// Create new hotel booking
const createHotelBooking = asyncHandler(async (req, res) => {
  const bookingData = {
    ...req.body,
    userId: req.user.id
  };

  const booking = await HotelBooking.create(bookingData);
  
  res.status(201).json({
    success: true,
    message: 'Hotel booking created successfully',
    data: booking
  });
});

// Update hotel booking
const updateHotelBooking = asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Hotel booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Hotel booking updated successfully',
    data: booking
  });
});

// Delete hotel booking
const deleteHotelBooking = asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Hotel booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Hotel booking deleted successfully'
  });
});

// Cancel hotel booking
const cancelHotelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const booking = await HotelBooking.findOneAndUpdate(
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
      message: 'Hotel booking not found' 
    });
  }

  res.json({
    success: true,
    message: 'Hotel booking cancelled successfully',
    data: booking
  });
});

// Search hotel options (mock implementation)
const searchHotelOptions = asyncHandler(async (req, res) => {
  const { destination, checkIn, checkOut, guests, rooms, budget, amenities } = req.query;
  
  // Mock hotel options based on search criteria
  const mockOptions = generateMockHotelOptions(destination, checkIn, checkOut, guests, rooms, budget, amenities);

  res.json({
    success: true,
    data: {
      searchCriteria: { destination, checkIn, checkOut, guests, rooms, budget, amenities },
      options: mockOptions,
      totalResults: mockOptions.length
    }
  });
});

// Get hotel statistics
const getHotelStats = asyncHandler(async (req, res) => {
  const stats = await HotelBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' },
        avgStayDuration: { $avg: '$stayDuration' },
        bookingsByStatus: {
          $push: {
            status: '$status',
            amount: '$totalAmount'
          }
        }
      }
    }
  ]);

  const statusBreakdown = await HotelBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const destinationBreakdown = await HotelBooking.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$destination',
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
        avgAmount: 0,
        avgStayDuration: 0
      },
      statusBreakdown,
      destinationBreakdown,
      recentBookings: await HotelBooking.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('hotelName destination status totalAmount checkIn checkOut createdAt')
    }
  };

  res.json(response);
});

// Get available amenities
const getAvailableAmenities = asyncHandler(async (req, res) => {
  const amenities = [
    { id: 'wifi', name: 'Free WiFi', icon: 'wifi' },
    { id: 'parking', name: 'Free Parking', icon: 'car' },
    { id: 'pool', name: 'Swimming Pool', icon: 'swimming' },
    { id: 'gym', name: 'Fitness Center', icon: 'dumbbell' },
    { id: 'spa', name: 'Spa & Wellness', icon: 'spa' },
    { id: 'restaurant', name: 'Restaurant', icon: 'utensils' },
    { id: 'bar', name: 'Bar/Lounge', icon: 'glass' },
    { id: 'concierge', name: '24/7 Concierge', icon: 'bell' },
    { id: 'room_service', name: 'Room Service', icon: 'bed' },
    { id: 'laundry', name: 'Laundry Service', icon: 'tshirt' },
    { id: 'business_center', name: 'Business Center', icon: 'briefcase' },
    { id: 'kids_club', name: 'Kids Club', icon: 'child' }
  ];

  res.json({
    success: true,
    data: amenities
  });
});

// Helper function to generate mock hotel options
const generateMockHotelOptions = (destination, checkIn, checkOut, guests, rooms, budget, amenities) => {
  const options = [];
  const hotelNames = [
    'Grand Plaza Hotel', 'Seaside Resort', 'Business Inn', 'Heritage Palace', 'Modern Suites',
    'Luxury Lodge', 'City Center Hotel', 'Mountain View Resort', 'Beachfront Villa', 'Downtown Plaza'
  ];
  
  const hotelTypes = ['5-Star Luxury', '4-Star Premium', '3-Star Comfort', '2-Star Budget', 'Boutique'];
  
  for (let i = 0; i < 8; i++) {
    const basePrice = Math.floor(Math.random() * 3000) + 1000;
    const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
    
    const option = {
      id: `hotel_${Math.random().toString(36).substr(2, 9)}`,
      hotelName: hotelNames[Math.floor(Math.random() * hotelNames.length)],
      hotelType: hotelTypes[Math.floor(Math.random() * hotelTypes.length)],
      destination,
      rating: parseFloat(rating),
      pricePerNight: basePrice,
      totalPrice: basePrice * (Math.random() * 5 + 2), // 2-7 nights
      amenities: getRandomAmenities(),
      images: [
        `https://picsum.photos/400/300?random=${i + 1}`,
        `https://picsum.photos/400/300?random=${i + 2}`,
        `https://picsum.photos/400/300?random=${i + 3}`
      ],
      availableRooms: Math.floor(Math.random() * 20) + 5,
      checkIn,
      checkOut,
      guests: parseInt(guests) || 2,
      rooms: parseInt(rooms) || 1
    };
    
    // Filter by budget if specified
    if (budget && option.totalPrice > budget) {
      continue;
    }
    
    // Filter by amenities if specified
    if (amenities && !amenities.every(amenity => option.amenities.includes(amenity))) {
      continue;
    }
    
    options.push(option);
  }
  
  return options.sort((a, b) => a.totalPrice - b.totalPrice);
};

// Helper function to get random amenities
const getRandomAmenities = () => {
  const allAmenities = ['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'concierge', 'room_service', 'laundry'];
  const numAmenities = Math.floor(Math.random() * 6) + 3; // 3-8 amenities
  const shuffled = allAmenities.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAmenities);
};

module.exports = {
  getAllHotelBookings,
  getHotelBooking,
  createHotelBooking,
  updateHotelBooking,
  deleteHotelBooking,
  cancelHotelBooking,
  searchHotelOptions,
  getHotelStats,
  getAvailableAmenities
};
