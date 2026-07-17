const express = require('express');
const { savingsEntries } = require('../models/savingsModel');

const router = express.Router();

// POST /api/savings  - add a savings entry
router.post('/', (req, res) => {
  const { amount, type, description, date } = req.body;

  if (amount == null || !type) {
    return res.status(400).json({ message: 'Amount and type are required' });
  }

  const newEntry = {
    id: savingsEntries.length + 1,
    amount,
    type, // e.g. 'deposit' or 'expense'
    description: description || '',
    date: date || new Date().toISOString(),
  };

  savingsEntries.push(newEntry);

  return res.status(201).json({
    message: 'Savings entry added',
    entry: newEntry,
  });
});

// GET /api/savings  - list all savings entries
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Savings entries fetched',
    entries: savingsEntries,
  });
});

module.exports = router;