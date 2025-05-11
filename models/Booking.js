const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  quantity: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  qrCode: String
});
module.exports = mongoose.model('Booking', bookingSchema);