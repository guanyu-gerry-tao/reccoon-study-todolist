const mongoose = require('mongoose');

const mongooseObjectId = mongoose.Schema.Types.ObjectId;

const statusesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  color: { type: String },
  prev: { type: mongooseObjectId, ref: 'Status' },
  next: { type: mongooseObjectId, ref: 'Status' },
  userId: { type: mongooseObjectId, ref: 'User', required: true }
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Status', statusesSchema);