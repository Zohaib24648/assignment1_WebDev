const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./modules/auth');
const crudRouter = require('./modules/crud');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/WebDev")
  .then(() => {
    console.log('Connection has been established successfully.');
    // Use routers
    app.use('/auth', authRouter); // Prefix all auth routes with '/auth'
    app.use('/meals', crudRouter); // Prefix all meals-related routes with '/meals'
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch(error => console.error('Unable to connect to the database:', error));
