const mongoose = require('mongoose');

const dbStatus = {
  connected: false,
};

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not defined in environment variables; starting in fallback mode');
    return dbStatus;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    dbStatus.connected = true;
    console.log('MongoDB connected');
  } catch (error) {
    dbStatus.connected = false;
    console.error('MongoDB connection failed.');
    console.error('Check that MongoDB is running or that MONGO_URI points to a valid database.');
    console.error(error.message);
  }

  return dbStatus;
}

module.exports = { connectDB, dbStatus };
