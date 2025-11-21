// backend/migrate.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if the "users" collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCollectionExists = collections.some(col => col.name === 'users');

    if (!userCollectionExists) {
      console.log('🧱 Creating "users" collection...');
      await mongoose.connection.createCollection('users');
    } else {
      console.log('ℹ️ "users" collection already exists.');
    }

    // Create default admin user
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists.');
    } else {
      const admin = new User({ username: 'admin', password: 'admin' });
      await admin.save();
      console.log('✅ Default admin user created: admin / admin');
    }

    await mongoose.disconnect();
    console.log('🏁 Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

runMigration();
