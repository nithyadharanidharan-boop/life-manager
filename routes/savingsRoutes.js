const express = require('express');
const Savings = require('../models/savingsModel');
const { dbStatus } = require('../config/db');

const router = express.Router();

function ensureDbAvailable(res) {
  if (!dbStatus.connected) {
    return res.status(503).json({ message: 'Database is temporarily unavailable. Please try again later.' });
  }
  return null;
}

router.post('/', async (req, res) => {
  const unavailable = ensureDbAvailable(res);
  if (unavailable) return unavailable;

  try {
    const { amount, type, description, date } = req.body;

    if (amount == null || !type) {
      return res.status(400).json({ message: 'Amount and type are required' });
    }

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const newEntry = await Savings.create({
      amount,
      type,
      description: description || '',
      date: date || new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Savings entry added',
      entry: {
        id: newEntry._id,
        amount: newEntry.amount,
        type: newEntry.type,
        description: newEntry.description,
        date: newEntry.date,
      },
    });
  } catch (error) {
    console.error('Create savings error:', error);
    return res.status(500).json({ message: 'Server error while creating savings entry' });
  }
});

router.get('/', async (req, res) => {
  const unavailable = ensureDbAvailable(res);
  if (unavailable) return unavailable;

  try {
    const entries = await Savings.find({}).sort({ date: 1 });
    return res.status(200).json({
      message: 'Savings entries fetched',
      entries: entries.map((entry) => ({
        id: entry._id,
        amount: entry.amount,
        type: entry.type,
        description: entry.description,
        date: entry.date,
      })),
    });
  } catch (error) {
    console.error('Fetch savings error:', error);
    return res.status(500).json({ message: 'Server error while fetching savings entries' });
  }
});

module.exports = router;