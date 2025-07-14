const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  prev: { type: String, ref: 'Project' },
  next: { type: String, ref: 'Project' },
  userId: { type: String, ref: 'UserAuth', required: true }
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Project', projectSchema);