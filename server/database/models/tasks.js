const mongoose = require('mongoose');

const mongooseObjectId = mongoose.Schema.Types.ObjectId;

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  dueDate: { type: Date },
  description: { type: String },
  status: { type: mongooseObjectId, ref: 'Status', required: true },
  previousStatus: { type: mongooseObjectId, ref: 'Status' },
  projectId: { type: mongooseObjectId, ref: 'Project', required: true },
  prev: { type: mongooseObjectId, ref: 'Task' },
  next: { type: mongooseObjectId, ref: 'Task' },
  userId: { type: mongooseObjectId, ref: 'User', required: true }
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Task', taskSchema);