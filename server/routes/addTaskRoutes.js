const express = require('express');
const router = express.Router();
const Task = require('../database/models/tasks'); // Assuming Task model is defined in models/Task.js

const mongoose = require('mongoose');

/**
 * GET /api/tasks
 * get all tasks
 */
router.get('/', (req, res) => {
  const Task = mongoose.model('Task'); // Assuming Task model is defined in mongoose
  try {
    const { id, status, projectId } = req.query;
    if (id) {
      Task.findOne({ id: id })
        .then((task) => {
          if (!task) {
            return res.status(404).json({ error: 'Task not found' }); // 404 = not found
          }
          res.json(task);
        });
      return;
    }
    if (status && projectId) {
      Task.find({ status, projectId })
        .then((tasks) => {
          res.json(tasks);
        });
      return;
    }
    if (projectId) {
      Task.find({ projectId })
        .then((tasks) => {
          res.json(tasks);
        });
      return;
    }

    // If no filters are applied, return all tasks
    Task.find()
      .then((tasks) => {
        res.json(tasks);
      });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    return;
  }
});

/**
 * GET /api/tasks/:id
 * get a task by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Task.findOne({ id: id })
    .then((task) => {
      if (!task) {
        return res.status(404).json({ error: 'Task not found' }); // 404 = not found
      }
      res.json(task);
    })
    .catch((error) => {
      console.error('Error fetching task by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});

/**
 * POST /api/tasks
 * add a new task
 */
router.post('/', (req, res) => {
  const newTask = new Task({ ...req.body });
  newTask.save()
    .then(() => {
      res.status(201).json(newTask); // 201 = created
      console.log(`Task added with id: ${newTask.id}`);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
      console.error('Error adding task:', error);
    });
});

/** 
 * PATCH /api/tasks/:id
 * update a task by ID
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  Task.findOneAndUpdate({ id: id }, req.body, { new: true })
    .then((updatedTask) => {
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' }); // 404 = not found
      }
      res.json(updatedTask);
    })
    .catch((error) => {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});

/**
 * DELETE /api/tasks/:id
 * delete a task by ID
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Task.findOneAndDelete({ id: id })
    .then(() => {
      res.status(204).send(); // 204 = success, no content
    })
    .catch((error) => {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});

module.exports = router;