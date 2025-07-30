const mongoose = require('mongoose');

const statusesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  color: { type: String },
  projectId: { type: String, ref: 'Project', required: true }, // 项目ID
  prev: { type: String, ref: 'Status' },
  next: { type: String, ref: 'Status' },
  userId: { type: String, ref: 'UserAuth', required: true }
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Status', statusesSchema);