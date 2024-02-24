const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
router.use(express.json());

//mongoose schema for meals
const mealSchema = new mongoose.Schema({
  mealname: { type: String, unique: true, required: true },
  price: { type: Number, required: true },
  description : String,
});
//create model using the schema 
var Meal = mongoose.model("Meal", mealSchema);  

router.get('/viewMeals', authenticateToken, async (req, res) => {
  try {
    const meals = await Meal.find({});
    res.send(meals);
  } catch (error) {
    res.status(500).send({ message: "Error fetching meals", error: error.message });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'ZohaibMughal', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Attach user to request
    next();
  });
}

function requireRole(role) {
  return function(req, res, next) {
    if (!req.user.roles == role) {
      return res.status(403).send({ message: `Access denied. Requires ${role} role.` });
    }
    next();
  };
}

//admin can add, update, delete, view meals
router.post('/addMeal', authenticateToken, requireRole("Admin"), async (req, res) => {
  const { mealname, price, description } = req.body;
  console.log(req.body);
  try {
    const meal = new Meal({ mealname, price, description });
    await meal.save();
    res.status(201).send({ message: "Meal added successfully", meal });
  } catch (error) {
    res.status(500).send({ message: "Error adding meal", error: error.message });
  }
});

router.delete('/removeMeal', authenticateToken, requireRole("Admin"), async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ mealname: req.body.mealname });
    if (!meal) {
      return res.status(404).send({ message: "Meal not found" });
    }
    res.send({ message: "Meal removed successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error removing meal", error: error.message });
  }
});

router.patch('/updateMeal', authenticateToken, requireRole("Admin"), async (req, res) => {
  const { mealname, ...updateData } = req.body;
  const updates = Object.keys(updateData);
  const allowedUpdates = ['price', 'description']; // 'mealname' removed to prevent changing the mealname itself
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const meal = await Meal.findOne({ mealname });
    if (!meal) {
      return res.status(404).send({ message: "Meal not found" });
    }
    updates.forEach((update) => meal[update] = updateData[update]);
    await meal.save();
    res.send(meal);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
