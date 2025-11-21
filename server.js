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
  // origin: 'http://localhost:4200',
  origin: 'https://fund-for-employess.netlify.app/',  // Your Angular frontend https://fund-for-employess.netlify.app/
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// ----------------------
// 1️⃣ Connect to MongoDB
// ----------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------------
// 2️⃣ Define a User Schema
// ----------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// ----------------------
// 3️⃣ Register New Users (for testing)
// ----------------------
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to DB
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ----------------------
// 4️⃣ Login Route (check user in DB)
// ----------------------
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in DB
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    // Generate JWT token
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

// app.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Find user in DB
//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: 'Invalid username or password' });

//     // Compare provided password with hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

//     // Generate JWT token
//     const accessToken = jwt.sign(
//       { username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ accessToken });
//   } catch (error) {
//     console.error('Login Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// ----------------------
// 5️⃣ Protected Example Route
// ----------------------

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
;

app.get('/home', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// ----------------------
// 6️⃣ Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
