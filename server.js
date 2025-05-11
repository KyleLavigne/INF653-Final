require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/qrs', express.static(path.join(__dirname, 'public', 'qrs')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Root HTML welcome page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all for 404
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    return res.status(404).json({ error: '404 Not Found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
