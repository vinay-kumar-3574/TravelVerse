const express = require('express');
const Trip = require('../models/Trip');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { checkOwnership } = require('../middleware/auth');
require('dotenv').config();
const router = express.Router();

// @desc    Get all trips for a user
// @route   GET /api/trips
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const userId = req.user._id;

  // Build query
  const query = { userId };
  if (status) {
    query.status = status;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const trips = await Trip.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('transportBooking', 'status transportType')
    .populate('hotelBooking', 'status hotelName');

  const total = await Trip.countDocuments(query);

  res.json({
    success: true,
    data: {
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTrips: total,
        hasNextPage: skip + trips.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
}));

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
router.get('/:id', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('transportBooking')
    .populate('hotelBooking');

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  res.json({
    success: true,
    data: { trip }
  });
}));

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const {
    title,
    source,
    destination,
    budget,
    members,
    departureDate,
    returnDate,
    notes,
    tags
  } = req.body;

  // Validate dates
  if (new Date(departureDate) >= new Date(returnDate)) {
    throw new AppError('Return date must be after departure date', 400);
  }

  if (new Date(departureDate) < new Date()) {
    throw new AppError('Departure date cannot be in the past', 400);
  }

  const trip = new Trip({
    userId: req.user._id,
    title,
    source,
    destination,
    budget,
    members,
    departureDate,
    returnDate,
    notes,
    tags
  });

  await trip.save();

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: { trip }
  });
}));

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
router.put('/:id', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const {
    title,
    source,
    destination,
    budget,
    members,
    departureDate,
    returnDate,
    notes,
    tags,
    status
  } = req.body;

  const trip = req.resource;

  // Validate dates if they're being updated
  if (departureDate && returnDate) {
    if (new Date(departureDate) >= new Date(returnDate)) {
      throw new AppError('Return date must be after departure date', 400);
    }
  }

  if (departureDate && new Date(departureDate) < new Date()) {
    throw new AppError('Departure date cannot be in the past', 400);
  }

  // Update fields
  if (title !== undefined) trip.title = title;
  if (source !== undefined) trip.source = source;
  if (destination !== undefined) trip.destination = destination;
  if (budget !== undefined) trip.budget = budget;
  if (members !== undefined) trip.members = members;
  if (departureDate !== undefined) trip.departureDate = departureDate;
  if (returnDate !== undefined) trip.returnDate = returnDate;
  if (notes !== undefined) trip.notes = notes;
  if (tags !== undefined) trip.tags = tags;
  if (status !== undefined) trip.status = status;

  await trip.save();

  res.json({
    success: true,
    message: 'Trip updated successfully',
    data: { trip }
  });
}));

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete('/:id', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const trip = req.resource;

  // Check if trip can be deleted
  if (trip.status === 'booked' || trip.status === 'active') {
    throw new AppError('Cannot delete a booked or active trip', 400);
  }

  await Trip.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
}));

// @desc    Add expense to trip
// @route   POST /api/trips/:id/expenses
// @access  Private
router.post('/:id/expenses', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const { category, description, amount, date, receipt } = req.body;
  const trip = req.resource;

  if (!category || !description || !amount) {
    throw new AppError('Category, description, and amount are required', 400);
  }

  trip.expenses.push({
    category,
    description,
    amount: parseFloat(amount),
    date: date || new Date(),
    receipt
  });

  await trip.save();

  res.json({
    success: true,
    message: 'Expense added successfully',
    data: { trip }
  });
}));

// @desc    Update expense
// @route   PUT /api/trips/:id/expenses/:expenseId
// @access  Private
router.put('/:id/expenses/:expenseId', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const { category, description, amount, date, receipt } = req.body;
  const trip = req.resource;
  const expenseId = req.params.expenseId;

  const expense = trip.expenses.id(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  if (category !== undefined) expense.category = category;
  if (description !== undefined) expense.description = description;
  if (amount !== undefined) expense.amount = parseFloat(amount);
  if (date !== undefined) expense.date = date;
  if (receipt !== undefined) expense.receipt = receipt;

  await trip.save();

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: { trip }
  });
}));

// @desc    Delete expense
// @route   DELETE /api/trips/:id/expenses/:expenseId
// @access  Private
router.delete('/:id/expenses/:expenseId', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const trip = req.resource;
  const expenseId = req.params.expenseId;

  trip.expenses = trip.expenses.filter(expense => expense._id.toString() !== expenseId);

  await trip.save();

  res.json({
    success: true,
    message: 'Expense deleted successfully',
    data: { trip }
  });
}));

// @desc    Add itinerary to trip
// @route   POST /api/trips/:id/itinerary
// @access  Private
router.post('/:id/itinerary', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const { day, date, activities } = req.body;
  const trip = req.resource;

  if (!day || !activities || !Array.isArray(activities)) {
    throw new AppError('Day and activities array are required', 400);
  }

  trip.itinerary.push({
    day: parseInt(day),
    date: date || new Date(),
    activities: activities.map(activity => ({
      time: activity.time,
      activity: activity.activity,
      location: activity.location,
      description: activity.description,
      cost: parseFloat(activity.cost) || 0
    }))
  });

  await trip.save();

  res.json({
    success: true,
    message: 'Itinerary added successfully',
    data: { trip }
  });
}));

// @desc    Update itinerary
// @route   PUT /api/trips/:id/itinerary/:day
// @access  Private
router.put('/:id/itinerary/:day', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const { activities } = req.body;
  const trip = req.resource;
  const day = parseInt(req.params.day);

  const itineraryDay = trip.itinerary.find(item => item.day === day);
  if (!itineraryDay) {
    throw new AppError('Itinerary day not found', 404);
  }

  if (activities && Array.isArray(activities)) {
    itineraryDay.activities = activities.map(activity => ({
      time: activity.time,
      activity: activity.activity,
      location: activity.location,
      description: activity.description,
      cost: parseFloat(activity.cost) || 0
    }));
  }

  await trip.save();

  res.json({
    success: true,
    message: 'Itinerary updated successfully',
    data: { trip }
  });
}));

// @desc    Get trip statistics
// @route   GET /api/trips/:id/stats
// @access  Private
router.get('/:id/stats', checkOwnership('Trip'), asyncHandler(async (req, res) => {
  const trip = req.resource;

  const stats = {
    totalExpenses: trip.totalExpenses,
    budgetRemaining: trip.budgetRemaining,
    budgetPercentageUsed: trip.budgetPercentageUsed,
    duration: trip.duration,
    daysUntilDeparture: Math.ceil((new Date(trip.departureDate) - new Date()) / (1000 * 60 * 60 * 24)),
    expenseBreakdown: {}
  };

  // Calculate expense breakdown by category
  if (trip.expenses && trip.expenses.length > 0) {
    trip.expenses.forEach(expense => {
      if (!stats.expenseBreakdown[expense.category]) {
        stats.expenseBreakdown[expense.category] = 0;
      }
      stats.expenseBreakdown[expense.category] += expense.amount;
    });
  }

  res.json({
    success: true,
    data: { stats }
  });
}));

module.exports = router;
