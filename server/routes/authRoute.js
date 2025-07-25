const express = require('express');
const loginUser = require('../controllers/authController'); // Import the loginUser function from authController

const router = express.Router();

router.post('/login', loginUser);

module.exports = router;