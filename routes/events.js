// File: routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');

// Public route: Get all events with optional filtering
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.date = { $gte: date, $lt: nextDate };
  }
  if (req.query.venue) filter.venue = req.query.venue;
  
  try {
    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Create a new event (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.json(newEvent);
});

// Update an event (admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (
    req.body.seatCapacity !== undefined &&
    req.body.seatCapacity < event.bookedSeats
  ) {
    return res.status(400).json({
      error: `Cannot reduce seat capacity (${req.body.seatCapacity}) below currently booked seats (${event.bookedSeats})`
    });
  }

  Object.assign(event, req.body);
  await event.save();
  res.json(event);
});

// Delete an event (admin only, only if no bookings)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete events' });
  }

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const bookings = await Booking.find({ event: event._id });
  if (bookings.length > 0) {
    return res.status(400).json({ error: 'Event has bookings and cannot be deleted' });
  }

  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted successfully' });
});

module.exports = router;
