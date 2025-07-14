const mongoose = require('mongoose');

const mongooseObjectId = mongoose.Schema.Types.ObjectId;

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  prev: { type: mongooseObjectId, ref: 'Project' },
  next: { type: mongooseObjectId, ref: 'Project' },
  userId: { type: mongooseObjectId, ref: 'User', required: true }
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Project', projectSchema);