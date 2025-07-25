const express = require('express');
const router = express.Router();
const Task = require('../database/models/tasks'); // Assuming Task model is defined in models/Task.js
const Project = require('../database/models/projects'); // Assuming Project model is defined in models/Project.js
const Status = require('../database/models/statuses'); // Assuming Status model is defined in models/
const UserProfile = require('../database/models/userProfiles'); // Assuming UserProfile model is defined in models/UserProfile.js
const validateBulkPayloadStructure = require('../middlewares/validatePayload'); // Import the validation middleware
const authMW = require('../middlewares/authMiddleware'); // Import the authentication middleware

/**
 * 
 */
router.post('/', [authMW, validateBulkPayloadStructure], async (req, res) => {
  console.log('receive bulk payload')
  const taskOps = [];
  const projectOps = [];
  const statusOps = [];
  const userProfileOps = [];

  const { ops, backup } = req.body;
  try {
    ops.forEach(op => {
      switch (op.type) {
        case 'task':
          switch (op.operation) {
            case 'add':
              taskOps.push({
                insertOne: {
                  document: op.data
                }
              })
              console.log(`task added: ${op.data.id}`);
              break;
            case 'update':
              taskOps.push({
                updateOne: {
                  filter: { id: op.data.id },
                  update: { $set: op.data.updatedFields }
                }
              })
              console.log(`task updated: ${op.data.id}`);
              break;
            case 'delete':
              taskOps.push({
                deleteOne: {
                  filter: { id: op.data.id }
                }
              })
              console.log(`task deleted: ${op.data.id}`);
              break;
          }
          break;
        case 'project':
          switch (op.operation) {
            case 'add':
              projectOps.push({
                insertOne: {
                  document: op.data
                }
              })
              console.log(`project added: ${op.data.id}`);
              break;
            case 'update':
              projectOps.push({
                updateOne: {
                  filter: { id: op.data.id },
                  update: { $set: op.data.updatedFields }
                }
              })
              console.log(`project updated: ${op.data.id}`);
              break;
            case 'delete':
              projectOps.push({
                deleteOne: {
                  filter: { id: op.data.id }
                }
              })
              console.log(`project deleted: ${op.data.id}`);
              break;
          }
          break;
        case 'status':
          switch (op.operation) {
            case 'add':
              statusOps.push({
                insertOne: {
                  document: op.data
                }
              })
              console.log(`status added: ${op.data.id}`);
              break;
            case 'update':
              statusOps.push({
                updateOne: {
                  filter: { id: op.data.id },
                  update: { $set: op.data.updatedFields }
                }
              })
              console.log(`status updated: ${op.data.id}`);
              break;
            case 'delete':
              statusOps.push({
                deleteOne: {
                  filter: { id: op.data.id }
                }
              })
              console.log(`status deleted: ${op.data.id}`);
              break;
          }
          break;
        case 'userProfile':
          switch (op.operation) {
            case 'update':
              userProfileOps.push({
                updateOne: {
                  filter: { id: op.data.id },
                  update: { $set: op.data.updatedFields }
                }
              })
              console.log(`userProfile updated: ${op.data.id}`);
              break;
          }

      }
    });

    // bulk write operations
    const [taskResult, projectResult, statusResult, userProfileResult] = await Promise.all([
      Task.bulkWrite(taskOps),
      Project.bulkWrite(projectOps),
      Status.bulkWrite(statusOps),
      UserProfile.bulkWrite(userProfileOps)
    ]);

    console.log(`task operations: ${taskResult.modifiedCount} modified, ${taskResult.deletedCount} deleted`);
    console.log(`project operations: ${projectResult.modifiedCount} modified, ${projectResult.deletedCount} deleted`);
    console.log(`status operations: ${statusResult.modifiedCount} modified, ${statusResult.deletedCount} deleted`);
    console.log(`userProfile operations: ${userProfileResult.modifiedCount} modified, ${userProfileResult.deletedCount} deleted`);

    if (taskResult.ok !== 1 || projectResult.ok !== 1 || statusResult.ok !== 1) {
      console.error('Bulk write operation failed');
      return res.status(500).json({ error: 'Bulk write operation failed' }); // 500 = internal server error
    } else {
      console.log('Bulk write operation succeeded');
      res.status(204).send(); // 204 = success, no content
    }
    console.log(`task operations completed`);
  } catch (error) {
    console.error('Error processing tasks:', error);
    return res.status(500).json({ error: 'Internal Server Error' }); // 500 = internal server error
  }
});


module.exports = router;