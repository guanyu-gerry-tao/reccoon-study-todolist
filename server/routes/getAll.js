const express = require('express');
const router = express.Router();
const Task = require('../database/models/tasks'); // Assuming Task model is defined in models/Task.js
const Project = require('../database/models/projects'); // Assuming Project model is defined in models/Project.js
const Status = require('../database/models/statuses'); // Assuming Status model is defined in models/Status.js
const UserProfile = require('../database/models/userProfiles'); // Assuming UserProfile model is defined in models/UserProfile.js

/**
 * GET /api/tasks
 * get all tasks
 */
router.get('/', (req, res) => {
  try {
    const { id, status, projectId } = req.query;
    const userId = req.headers['user-id']; // Assuming user ID is passed in headers

    // if (id) {
    //   Task.findOne({ id: id })
    //     .then((task) => {
    //       if (!task) {
    //         return res.status(404).json({ error: 'Task not found' }); // 404 = not found
    //       }
    //       res.json(task);
    //     });
    //   return;
    // }
    // if (status && projectId) {
    //   Task.find({ status, projectId })
    //     .then((tasks) => {
    //       res.json(tasks);
    //     });
    //   return;
    // }
    // if (projectId) {
    //   Task.find({ projectId })
    //     .then((tasks) => {
    //       res.json(tasks);
    //     });
    //   return;
    // }

    // If no filters are applied, return all tasks

    // Fetch all tasks, projects, and statuses and user profile
    const grabAllTasks = Task.find({ userId: userId }); // Assuming Task model has a userId field
    const grabAllProjects = Project.find({ userId: userId }); // Assuming Project model has a userId field
    const grabAllStatuses = Status.find({ userId: userId }); // Assuming Status model has a userId field
    const grabUserProfile = UserProfile.findOne({ id: userId }); // Use userId from headers

    console.log('Fetching all tasks, projects, statuses, and user profile for userId:', userId);

    Promise.all([grabAllTasks, grabAllProjects, grabAllStatuses, grabUserProfile])
      .then(([tasks, projects, statuses, userProfile]) => {
        res.json({
          tasks: tasks,
          projects: projects,
          statuses: statuses,
          userProfile: userProfile
        });
        console.log('Tasks, ', tasks);
        console.log('Projects, ', projects);
        console.log('Statuses, ', statuses);
        console.log('User Profile, ', userProfile);
        return;
      }).catch((error) => {
        console.error('Error fetching tasks, projects, or statuses:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
        throw error; // Re-throw the error to be caught by the outer catch block
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

module.exports = router;