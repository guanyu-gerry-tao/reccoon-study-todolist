const mongoose = require('mongoose');

const mongooseObjectId = mongoose.Schema.Types.ObjectId;

const statusesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  email: { type: String, required: true, match: /.+@.+/ },
  pwHash: { type: String, required: true },
  pwVersion: { type: String, required: true },
  salt: { type: String, required: true },
  createdIP: { type: String, required: true },
  lastLoginIP: { type: String, required: true },
  lastLoginAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('User', statusesSchema);