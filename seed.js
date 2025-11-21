// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get the connection string from .env
const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000, // wait 20s before timeout
    });
    console.log('✅ Connected to MongoDB');

    // Define User model
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });

    const User = mongoose.model('User', userSchema);

    // Clear existing users
    await User.deleteMany({});
    console.log('🧹 Old users removed');

    // Create sample users
    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('password', 10),
      },
      {
        username: 'user1',
        password: await bcrypt.hash('admin123', 10),
      },
    ];

    await User.insertMany(users);
    console.log('✅ Sample users inserted:', users.map(u => u.username).join(', '));
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

seed();
