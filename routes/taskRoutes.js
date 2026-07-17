const express = require('express');
const { tasks } = require('../models/taskModel');

const router = express.Router();

// POST /api/tasks  - create a task
router.post('/', (req, res) => {
  const { title, description, dueAt, priority, alarmEnabled } = req.body;

  if (!title || !dueAt) {
    return res.status(400).json({ message: 'Title and dueAt are required' });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    description: description || '',
    dueAt, // e.g. "2026-07-17T10:00"
    status: 'todo', // default
    priority: priority || 'normal',
    alarmEnabled: alarmEnabled === true,
  };

  tasks.push(newTask);

  return res.status(201).json({
    message: 'Task created',
    task: newTask,
  });
});

// GET /api/tasks  - list all tasks
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Tasks fetched',
    tasks,
  });
});

// PUT /api/tasks/:id  - update task status or details
router.put('/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === taskId);

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

  return res.status(200).json({
    message: 'Task updated',
    task,
  });
});

// DELETE /api/tasks/:id  - delete a task
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(index, 1);

  return res.status(200).json({ message: 'Task deleted' });
});

module.exports = router;