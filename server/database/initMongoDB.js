const mongoose = require('mongoose');
const Task = require('./models/tasks');
const Project = require('./models/projects');
const Status = require('./models/statuses');
const User = require('./models/users');

async function main() {
    await mongoose.connect('mongodb://localhost:27017/reccoon-study-db')
    .then(() => console.log("connected!"))
    .catch(err => console.error(err));

    

    await mongoose.disconnect()
    .then(() => console.log("disconnected"))
    .catch(err => console.error(err));
}

main().catch(err => console.error(err));