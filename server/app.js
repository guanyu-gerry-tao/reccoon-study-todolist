const express = require('express');
const bodyParser = require('body-parser');
const aiChatRouter = require('./api/ai-chat');

const app = express();
app.use(bodyParser.json());
app.use('/api/ai-chat', aiChatRouter);

app.get('/', (req, res) => {
  res.send('AI Chat API is running');
});

app.listen(4000, () => {
  console.log('Server running on port 4000');
});

const userRouter = require('./api/user');
app.use('/api', userRouter);