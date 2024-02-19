const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
router.use(express.json());





  // Define a password validator
  const emailValidator = {
    validator: function(value) {
      const isvalid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isvalid) {
        throw new Error("The email is not valid. Please enter a valid email address.");
      }
      return isvalid;
    },
  };

    
    const passwordValidator = {
      validator: function(value) {
        // Regular expression for password validation
        const isvalid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
        if (!isvalid) {throw new Error("Password must Contain 1 Uppercase, 1 Number and length > 8");
      }
        return isvalid;
      },
    };



    
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
    age: Number,
    roles : String
  });
  const User = mongoose.model('User', userSchema);
  

// POST METHODS FOR LOGIN AND SIGNUP
  
  router.post("/register", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (user) return res.json({ msg: "This email is already in use" });
      if (passwordValidator.validator(password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword });
  
      return res.json({ msg: "CREATED" });}
      throw new Error("Password must Contain 1 Uppercase, 1 Number and length > 8")
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ msg: error.message });
      } else {
        console.error(error);
        return res.status(500).json({ msg: error.message });
      }
    }
  });


  router.post("/registeradmin", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (user) return res.json({ msg: "This email is already in use" });
      if (passwordValidator.validator(password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword , roles: ["Admin"]});
  
      return res.json({ msg: "CREATED" });}
      throw new Error("Password must Contain 1 Uppercase, 1 Number and length > 8")
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
      if (!user) return res.json({ msg: "This email is not linked to any Account" });
  
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



  router.post("/adminlogin", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.json({ msg: "This email is not linked to any Account" });
  
      // check admin role
      if(user.roles=="Admin"){console.log("You are an admin")}
      else return res.json({ msg: "You are not an admin" });


      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) return res.json({ msg: "WRONG PASSWORD" });
  
      const token = jwt.sign({
        email,
        roles: user.roles,
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

