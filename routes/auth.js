const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  res.json({ message: 'User registered' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;