const express = require('express');
const loginUser = require('../controllers/authController'); // Import the loginUser function from authController

const router = express.Router();

router.post('/', loginUser);

module.exports = router;