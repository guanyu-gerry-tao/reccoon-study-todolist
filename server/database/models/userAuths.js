const mongoose = require('mongoose');

const userAuthSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, match: /.+@.+/, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  pwHash: { type: String, required: true },
  pwVersion: { type: String, required: true },
  salt: { type: String, required: true },
  createdIP: { type: String, required: true },
  createdAt: { type: Date, required: true },
  lastLoginIP: { type: String, required: true },
  lastLoginAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('UserAuth', userAuthSchema);