const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();


const emailValidator = {
    validator: function(value) {
      // Regular expression for email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: props => `${props.value} is not a valid email address!`
  };
  
  const passwordValidator = {
    validator: function(value) {
      // Regular expression for password validation
      return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    },
    message: props => `${props.value} is not a valid password! Password must contain at least one capital letter, one number, and be at least 8 characters long.`
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
    age: Number
  
  });
  const User = mongoose.model('User', userSchema);
  

  
router.post("/register", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (user) return res.json({ msg: "USER EXISTS" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword });
  
      return res.json({ msg: "CREATED" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
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
        password,
        createdAt: new Date(),
        age: user.age, // Ensure your User model has an 'age' field; otherwise, remove this line
      }, "MY_SECRET", { expiresIn: "1d" });
  
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
