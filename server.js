const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors({
  origin: [ 
    'https://fund-for-employess.netlify.app',
    'http://localhost:4200',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Health check route
app.get('/api', (req, res) => {
  res.json({ message: '✅ Backend is working!' });
});

// 1️⃣ Connect to MongoDB (updated)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 2️⃣ User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Check if any field is missing
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this username, email, or phone' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// 4️⃣ Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid username or password' });

    const accessToken = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 5️⃣ Protected Route Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Corrected typo: 'authorization' instead of 'authorizatio'

  if (!token)
    return res.status(403).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();

  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Example protected route
app.get('/home', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

// Dashboard routes
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const loanRoutes = require("./routes/loan-calculator");
app.use("/api/loan", loanRoutes);

const balance = require("./routes/balance");
app.use("/api/balance", balance);

// 6️⃣ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
