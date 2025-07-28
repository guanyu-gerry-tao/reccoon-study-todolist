const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 会话唯一ID
    title: { type: String, default: 'New Conversation' }, // 会话标题
    userId: { type: String, ref: 'UserAuth', required: true }, // 用户ID
}, { timestamps: true, strict: 'throw' });

module.exports = mongoose.model('Conversation', conversationSchema);