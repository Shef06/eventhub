import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;

async function connectToMongo() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db('ProjectEventsDB');
    console.log('Connected to MongoDB');
    
    // Initialize auto-incrementing counters if they don't exist
    const counters = db.collection('Counters');
    const collections = ['User', 'Event'];
    
    for (const collection of collections) {
      const counter = await counters.findOne({ _id: collection });
      if (!counter) {
        await counters.insertOne({ _id: collection, seq: 0 });
      }
    }
    
    // Make db available globally
    app.locals.db = db;
    
    // Start server after DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// Connect to MongoDB
connectToMongo();