const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// load routes
const addTaskRoutes = require('./routes/addTaskRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// load middlewares
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // automatically parse JSON request bodies

// use all API routes
app.use('/api/tasks', addTaskRoutes);


// start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});