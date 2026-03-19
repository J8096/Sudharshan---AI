const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('user:password@cluster')) {
    console.log('  ⚠ No MongoDB URI set — using in-memory storage (all data resets on restart)');
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    console.log(`  ✓ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`  ⚠ MongoDB failed (${err.message.slice(0, 60)}) — using in-memory storage`);
  }
};

module.exports = connectDB;
