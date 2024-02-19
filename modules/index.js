const express = require("express")
const router = express.Router();
const authRouter = require('./auth');
const crudRouter = require('./crud');

router.use("/auth", authRouter); // Prefix all auth routes with '/auth'
router.use("/meals", crudRouter); // Prefix all meals-related routes with '/meals'

module.exports = router;
