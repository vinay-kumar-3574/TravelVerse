const Trip = require('../models/Trip');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all trips for a user
const getAllTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { source: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const trips = await Trip.find(query)
    .populate('transportBooking')
    .populate('hotelBooking')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOptions);

  const total = await Trip.countDocuments(query);

  res.json({
    success: true,
    data: {
      trips,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// Get single trip
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('transportBooking')
    .populate('hotelBooking')
    .populate('familyMembers');

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  res.json({
    success: true,
    data: trip
  });
});

// Create new trip
const createTrip = asyncHandler(async (req, res) => {
  const tripData = {
    ...req.body,
    userId: req.user.id
  };

  const trip = await Trip.create(tripData);
  
  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: trip
  });
});

// Update trip
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('transportBooking').populate('hotelBooking');

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  res.json({
    success: true,
    message: 'Trip updated successfully',
    data: trip
  });
});

// Delete trip
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

// Add expense to trip
const addExpense = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
  
  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  trip.expenses.push(req.body);
  await trip.save();

  res.json({
    success: true,
    message: 'Expense added successfully',
    data: trip.expenses[trip.expenses.length - 1]
  });
});

// Update expense
const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  
  const trip = await Trip.findOneAndUpdate(
    { 
      _id: req.params.id, 
      userId: req.user.id,
      'expenses._id': expenseId 
    },
    { 
      $set: { 
        'expenses.$': req.body 
      } 
    },
    { new: true, runValidators: true }
  );

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip or expense not found' 
    });
  }

  const updatedExpense = trip.expenses.find(exp => exp._id.toString() === expenseId);

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: updatedExpense
  });
});

// Delete expense
const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $pull: { expenses: { _id: expenseId } } },
    { new: true }
  );

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// Add itinerary item
const addItineraryItem = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
  
  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  trip.itinerary.push(req.body);
  await trip.save();

  res.json({
    success: true,
    message: 'Itinerary item added successfully',
    data: trip.itinerary[trip.itinerary.length - 1]
  });
});

// Update itinerary item
const updateItineraryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  
  const trip = await Trip.findOneAndUpdate(
    { 
      _id: req.params.id, 
      userId: req.user.id,
      'itinerary._id': itemId 
    },
    { 
      $set: { 
        'itinerary.$': req.body 
      } 
    },
    { new: true, runValidators: true }
  );

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip or itinerary item not found' 
    });
  }

  const updatedItem = trip.itinerary.find(item => item._id.toString() === itemId);

  res.json({
    success: true,
    message: 'Itinerary item updated successfully',
    data: updatedItem
  });
});

// Delete itinerary item
const deleteItineraryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $pull: { itinerary: { _id: itemId } } },
    { new: true }
  );

  if (!trip) {
    return res.status(404).json({ 
      success: false, 
      message: 'Trip not found' 
    });
  }

  res.json({
    success: true,
    message: 'Itinerary item deleted successfully'
  });
});

// Get trip statistics
const getTripStats = asyncHandler(async (req, res) => {
  const stats = await Trip.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        totalExpenses: { $sum: { $sum: '$expenses.amount' } },
        avgBudget: { $avg: '$budget' },
        tripsByStatus: {
          $push: {
            status: '$status',
            budget: '$budget'
          }
        }
      }
    }
  ]);

  const statusBreakdown = await Trip.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' }
      }
    }
  ]);

  const response = {
    success: true,
    data: {
      overview: stats[0] || {
        totalTrips: 0,
        totalBudget: 0,
        totalExpenses: 0,
        avgBudget: 0
      },
      statusBreakdown,
      recentTrips: await Trip.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title source destination status budget createdAt')
    }
  };

  res.json(response);
});

module.exports = {
  getAllTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addExpense,
  updateExpense,
  deleteExpense,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  getTripStats
};
