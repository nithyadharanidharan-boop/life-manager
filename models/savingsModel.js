const mongoose = require('mongoose');

const savingsSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Savings = mongoose.model('Savings', savingsSchema);

module.exports = Savings;