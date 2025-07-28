const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const Conversation = require('../database/models/conversations');
const Message = require('../database/models/messages');

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 调用 OpenAI API 生成回复
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = aiResponse.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate AI reply' });
  }
  // res.json({ reply: "This is a mock AI reply." }); 
});

module.exports = router;