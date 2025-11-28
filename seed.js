require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Ensure MONGODB_URI is set
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in the .env file');
  process.exit(1); // Exit the process if the connection string is missing
}

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000, // wait 20s before timeout
    });
    console.log('✅ Connected to MongoDB');

    // Define User model with additional fields
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });

    const User = mongoose.model('User', userSchema);

    // Clear existing users (and log the count of removed users)
    const deletedUsers = await User.deleteMany({});
    console.log(`🧹 Removed ${deletedUsers.deletedCount} old users`);

    // Create sample users with name, email, phone, and password
    const users = [
      {
        name: 'Admin',
        email: 'admin@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('password', 10),
      },
    ];

    // Insert users and log the result
    const insertedUsers = await User.insertMany(users);
    console.log('✅ Sample users inserted:', insertedUsers.map(u => u.email).join(', '));

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

seed();
