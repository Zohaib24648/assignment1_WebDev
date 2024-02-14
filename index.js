const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const authRouter = require('./routes/auth');
// Create Express app
const app = express();


app.use('/', authRouter);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/WebDev")
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
