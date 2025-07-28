const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // 会话唯一ID
  title: { type: String, default: 'New Conversation' }, // 会话标题
  content: { type: String, required: true }, // 消息内容
  role: { type: String, enum: ['user', 'ai'], required: true }, // 消息角色
  conversationId: { type: String, ref: 'Conversation', required: true }, // 会话ID
  userId: { type: String, ref: 'UserAuth', required: true }, // 用户ID
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Message', messageSchema);