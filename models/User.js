const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Enable CORS for all origins (not recommended for production)
app.use(cors());

// Alternatively, you can specify specific origins like this:
app.use(cors({
  origin: 'http://localhost:4200',  // Allow only your frontend URL
  methods: ['GET', 'POST'],        // Allow only these methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
}));

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Example login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Check credentials
  if (username === 'admin' && password === 'password') {
    const user = { username };
    const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ accessToken });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
