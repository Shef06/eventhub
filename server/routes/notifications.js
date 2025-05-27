import express from 'express';
import { ObjectId } from 'mongodb';
import auth from '../middleware/auth.js';
import { getTimestamps, updateTimestamp } from '../utils/db.js';

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notifications = await db.collection('Notification')
      .find({ user: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .toArray();
      
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notification = await db.collection('Notification').findOneAndUpdate(
      { 
        _id: new ObjectId(req.params.id),
        user: new ObjectId(req.userId)
      },
      { 
        $set: { 
          read: true,
          ...updateTimestamp()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!notification.value) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification.value);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Create notification
router.post('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notification = {
      user: new ObjectId(req.userId),
      message: req.body.message,
      type: req.body.type,
      read: false,
      ...getTimestamps()
    };

    const result = await db.collection('Notification').insertOne(notification);
    res.status(201).json({ ...notification, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: "Error creating notification" });
  }
});

export default router;