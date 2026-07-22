const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueAt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    alarmEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;