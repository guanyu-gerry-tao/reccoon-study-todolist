const express = require('express');
const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ user: null });
});

router.get('/getAll', (req, res) => {
  res.json({ data: [] });
});

router.post('/login', (req, res) => {
  res.json({ success: true });
});

module.exports = router;