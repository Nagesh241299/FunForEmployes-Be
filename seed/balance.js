require('dotenv').config({ path: '../.env' }); // explicitly point to backend/.env
const mongoose = require('mongoose');
const Balance = require('../models/Balance');

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
  console.log('✅ Connected to MongoDB Atlas');

  try {
    // Clear existing data
    await Balance.deleteMany({});
    console.log('🧹 Existing balances cleared');

    // Seed new data
    const balanceData = {
      grandTotal: 5000000,      // Example: 50 Lakh
      loanDistributed: 2000000, // Example: 20 Lakh
      limit: 1000000            // Example: 10 Lakh
    };

    await Balance.create(balanceData);
    console.log('✅ Balance data seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
