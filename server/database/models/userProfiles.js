const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userAuthId: { type: String, ref: 'UserAuth', required: true },
  nickname: { type: String, required: true },
  focusProject: { type: String, ref: 'Project' },
  focusConversation: { type: String, ref: 'Conversation' },
  avatarUrl: { type: String, default: '' },
  language: { type: String, default: 'en-US' },
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('UserProfile', userProfileSchema);