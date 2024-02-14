const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
router.use(express.json());

  // Define a User model
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      unique:true,
      required:true,
      validate: emailValidator
      
      },
  
    password: {
      type: String,
      required:true,
      validate: passwordValidator
  
    },
  
    firstname : String,
    lastname : String,
    age: Number
  
  });
  const User = mongoose.model('User', userSchema);
  




  // Define a password validator
  const emailValidator = {
    validator: function(value) {
      const isvalid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isvalid) {
        throw new Error("Email is not valid");
      }
      return isvalid;
    },
  };
    
    const passwordValidator = {
      validator: function(value) {
        // Regular expression for password validation
        const isvalid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
        if (!isvalid) {throw new Error("Password is not valid");
      }
        return isvalid;
      },
    };


// POST METHODS FOR LOGIN AND SIGNUP
  
  router.post("/register", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (user) return res.json({ msg: "USER EXISTS" });
      if (passwordValidator.validator(password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword });
  
      return res.json({ msg: "CREATED" });}
      throw new Error("Password is not valid")
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ msg: error.message });
      } else {
        console.error(error);
        return res.status(500).json({ msg: error.message });
      }
    }
  });
  
  
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.json({ msg: "USER NOT FOUND" });
  
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) return res.json({ msg: "WRONG PASSWORD" });
  
      const token = jwt.sign({
        email,
        createdAt: new Date(),
      }, "ZohaibMughal", { expiresIn: "1d" });
  
      res.json({
        msg: "LOGGED IN", token
      });
    }
     catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
    }
  });
  

  module.exports = router;
