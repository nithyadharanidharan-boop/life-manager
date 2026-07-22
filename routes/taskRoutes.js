const express = require('express');
const Task = require('../models/taskModel');
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
    const { title, description, dueAt, priority, alarmEnabled } = req.body;

    if (!title || !dueAt) {
      return res.status(400).json({ message: 'Title and dueAt are required' });
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      dueAt,
      status: 'todo',
      priority: priority || 'normal',
      alarmEnabled: alarmEnabled === true,
    });

    return res.status(201).json({
      message: 'Task created',
      task: {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        dueAt: newTask.dueAt,
        status: newTask.status,
        priority: newTask.priority,
        alarmEnabled: newTask.alarmEnabled,
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error while creating task' });
  }
});

router.get('/', async (req, res) => {
  const unavailable = ensureDbAvailable(res);
  if (unavailable) return unavailable;

  try {
    const tasks = await Task.find({}).sort({ dueAt: 1 });
    return res.status(200).json({
      message: 'Tasks fetched',
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        dueAt: task.dueAt,
        status: task.status,
        priority: task.priority,
        alarmEnabled: task.alarmEnabled,
      })),
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

router.put('/:id', async (req, res) => {
  const unavailable = ensureDbAvailable(res);
  if (unavailable) return unavailable;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, dueAt, status, priority, alarmEnabled } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueAt !== undefined) task.dueAt = dueAt;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (alarmEnabled !== undefined) task.alarmEnabled = alarmEnabled;

    await task.save();

    return res.status(200).json({
      message: 'Task updated',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        dueAt: task.dueAt,
        status: task.status,
        priority: task.priority,
        alarmEnabled: task.alarmEnabled,
      },
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error while updating task' });
  }
});

router.delete('/:id', async (req, res) => {
  const unavailable = ensureDbAvailable(res);
  if (unavailable) return unavailable;

  try {
    const result = await Task.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error while deleting task' });
  }
});

module.exports = router;