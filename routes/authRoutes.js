const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({ message: 'Username must be at least 2 characters' });
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    if (typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    return res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, username: newUser.username, email: newUser.email } });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;