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
 * add new tasks
 */
router.post('/', (req, res) => {

  // // Validate request body
  // if (!req.body ||
  //   !Array.isArray(req.body) ||
  //   req.body.length === 0
  // ) {
  //   return res.status(400).json({ error: 'Invalid request body for POST operation' }); // 400 = bad request
  // }

  // build bulkwrite operations
  const { newTasks, updateTasks } = req.body;
  const bulkOps = newTasks.map(item => {
    return {
      insertOne: {
        document: item,
      }
    };
  });
  bulkOps.push({
    updateOne: {
      filter: { id: updateTasks[0].id },
      update: { $set: updateTasks[0].updatedFields },
    }
  });

  Task.bulkWrite(bulkOps)
    .then((result) => {
      if (result.insertedCount < newTasks.length) {
        return res.status(400).json({ error: `Some tasks not added, expect ${newTasks.length} but only succeeded ${result.insertedCount}` }); // 400 = bad request
      }
      if (result.modifiedCount < updateTasks.length) {
        return res.status(400).json({ error: `Some tasks not updated, expect ${updateTasks.length} but only succeeded ${result.modifiedCount}` }); // 400 = bad request
      }
      return res.status(204).send(); // 204 = success, no content
    }).catch((error) => {
      console.error('Error adding tasks:', error);
      return res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});

/** 
 * PATCH /api/tasks/
 * update a task by IDs
 */
router.patch('/', (req, res) => {
  // Validate request body
  if (!req.body ||
    !Array.isArray(req.body) ||
    req.body.length === 0 ||
    typeof req.body[0].id !== 'string' ||
    typeof req.body[0].updatedFields !== 'object'
  ) {
    return res.status(400).json({ error: 'Invalid request body for PATCH operation' }); // 400 = bad request
  }

  const bulkOps = req.body.map(item => {
    const { id, updatedFields } = item;
    return {
      updateOne: {
        filter: { id: id },
        update: { $set: updatedFields },
      }
    };
  });

  Task.bulkWrite(bulkOps)
    .then((result) => {
      if (result.modifiedCount < req.body.length) {
        return res.status(404).json({ error: `Some tasks not found, expect ${req.body.length} but only succeeded ${result.modifiedCount}` }); // 404 = not found
      }
      return res.status(204).send(); // 204 = success, no content
    }).catch((error) => {
      console.error('Error updating tasks:', error);
      return res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});


/**
 * DELETE /api/tasks/
 * delete a task by IDs
 */
router.delete('/', (req, res) => {

  // Validate request body
  if (!req.body ||
    !Array.isArray(req.body) ||
    req.body.length === 0 ||
    typeof req.body[0] !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid request body for DELETE operation' }); // 400 = bad request
  }

  // Extract IDs from the request body
  const { deleteTasks, updateTasks } = req.body;
  const bulkOps = []; 
  deleteTasks.forEach(item => {
    bulkOps.push( {
      deleteOne: {
        filter: { id: item },
      }
    });
  });
  updateTasks.forEach(item => {
    bulkOps.push({
      updateOne: {
        filter: { id: item.id },
        update: { $set: item.updatedFields },
      }
    });
  });
  Task.bulkWrite(bulkOps)
    .then((result) => {
      if (result.deletedCount < deleteTasks.length) {
        return res.status(404).json({ error: `Some tasks not found, expect ${deleteTasks.length} but only succeeded ${result.deletedCount}` }); // 404 = not found
      }
      if (result.modifiedCount < updateTasks.length) {
        return res.status(400).json({ error: `Some tasks not updated, expect ${updateTasks.length} but only succeeded ${result.modifiedCount}` }); // 400 = bad request
      }
      return res.status(204).send(); // 204 = success, no content
    }).catch((error) => {
      console.error('Error deleting tasks:', error);
      return res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
    });
});


module.exports = router;