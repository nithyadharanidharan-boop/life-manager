const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error('Check that MongoDB is running or that MONGO_URI points to a valid database.');
    throw error;
  }
}

module.exports = { connectDB };
