import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    await mongoose.connect(memoryServer.getUri());
    console.log('Connected to in-memory MongoDB for local development');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.warn('MongoDB connection failed, falling back to in-memory database:', error.message);
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    await mongoose.connect(memoryServer.getUri());
    console.log('Connected to fallback in-memory MongoDB');
  }
}
