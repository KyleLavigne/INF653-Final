// File: routes/bookings.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const generateQRCode = require('../utils/generateQRCode');
const sendEmail = require('../utils/sendEmail');

// Clean up old QR codes every 24 hours
const cleanupOldQRCodes = () => {
  const qrDir = path.join(__dirname, '../private_qrs');
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  fs.readdir(qrDir, (err, files) => {
    if (err) return console.error('QR cleanup error:', err);
    files.forEach(file => {
      const filePath = path.join(qrDir, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && now - stats.ctimeMs > maxAge) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};

setInterval(cleanupOldQRCodes, 24 * 60 * 60 * 1000); // once a day

// Get all bookings for the authenticated user
router.get('/', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('event');
  res.json(bookings);
});

// Get a specific booking by ID
router.get('/:id', auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking || booking.user.toString() !== req.user._id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(booking);
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  const { event: eventId, quantity } = req.body;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Check if the event is already fully booked
  if (event.bookedSeats + quantity > event.seatCapacity) {
    return res.status(400).json({ error: 'Not enough available seats' });
  }

  // Generate QR code
  const booking = new Booking({ user: req.user._id, event: eventId, quantity });
  const qrBase64 = await generateQRCode(`BOOKING:${booking._id}`);
  const fileName = `qr-${booking._id}.png`;
  const qrDir = path.join(__dirname, '../private_qrs');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }
  const filePath = path.join(qrDir, fileName);

  // Save QR code to file
  const base64Data = qrBase64.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(filePath, base64Data, 'base64');

  
  booking.qrCode = fileName;
  await booking.save();

  event.bookedSeats += quantity;
  await event.save();

  const user = await User.findById(req.user._id);
  const userEmail = user.email;

  const qrToken = jwt.sign({ id: booking._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const qrLink = `${req.protocol}://${req.get('host')}/api/bookings/qr/${booking._id}?token=${qrToken}`;

  const emailHTML = `
    <h2>Booking Confirmed!</h2>
    <p>You booked <strong>${quantity}</strong> ticket(s) to <strong>${event.title}</strong> at <strong>${event.venue}</strong>.</p>
    <p>Date: ${event.date.toDateString()} | Time: ${event.time}</p>
    <p><strong>Click below to view your QR code:</strong></p>
    <p><a href="${qrLink}" target="_blank">View QR Code</a></p>
  `;

  await sendEmail(userEmail, 'Your Event Booking Confirmation', emailHTML);

  res.json(booking);
});

// QR code fetcher with token-based validation
router.get('/qr/:id', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'Token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== req.params.id) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const filePath = path.join(__dirname, '../private_qrs', booking.qrCode);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Unauthorized access' });
  }
});

// Validate booking by QR code string
router.get('/validate/:qr', async (req, res) => {
  try {
    const qrValue = req.params.qr;
    const bookingId = qrValue.replace('BOOKING:', '');
    const booking = await Booking.findById(bookingId).populate('event user');

    if (!booking) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired QR code' });
    }

    res.json({
      valid: true,
      booking: {
        id: booking._id,
        event: booking.event.title,
        user: booking.user.name,
        quantity: booking.quantity,
        date: booking.bookingDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// Admin dashboard: show all events with users who booked each
router.get('/admin/dashboard', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }

  try {
    const events = await Event.find();
    const dashboard = await Promise.all(events.map(async (event) => {
      const bookings = await Booking.find({ event: event._id }).populate('user');
      return {
        event: event.title,
        date: event.date,
        bookings: bookings.map(b => ({
          user: b.user.name,
          email: b.user.email,
          quantity: b.quantity
        }))
      };
    }));

    res.json(dashboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
