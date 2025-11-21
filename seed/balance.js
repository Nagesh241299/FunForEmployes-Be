// seed/balance.js
require('dotenv').config(); // load .env variables
const mongoose = require('mongoose');

// Replace with your actual model
const Dashboard = require('../models/dashboard'); 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Optional: Clear existing data
    await Dashboard.deleteMany({});
    console.log('Existing dashboards cleared');

    // Seed new data
    const dashboards = [
      { name: 'Balance', amount: 12345 },
      { name: 'Loans', amount: 3 },
      { name: 'Payments', amount: 250 }
    ];

    await Dashboard.insertMany(dashboards);
    console.log('Seed data inserted successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
