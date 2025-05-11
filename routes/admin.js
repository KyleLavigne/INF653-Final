const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Admin dashboard: List all events with bookings and users
// Check if the user is authenticated and has admin role

router.get('/dashboard', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const events = await Event.find();
  const data = await Promise.all(events.map(async (event) => {
    const bookings = await Booking.find({ event: event._id }).populate('user');
    return {
      event,
      bookings: bookings.map(b => ({
        user: b.user.name,
        email: b.user.email,
        quantity: b.quantity,
        date: b.bookingDate
      }))
    };
  }));
  res.json(data);
});

module.exports = router;
