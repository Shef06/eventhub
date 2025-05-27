import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getNextSequence, getTimestamps } from '../utils/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = req.app.locals.db;
    
    const existingUser = await db.collection('User').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await getNextSequence(db, 'User');
    
    const user = {
      _id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdEvents: [],
      subscribedEvents: [],
      ...getTimestamps()
    };

    await db.collection('User').insertOne(user);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    const user = await db.collection('User').findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials " });
    }
    const hash = await bcrypt.hash(password, 12);
    console.log(hash);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Include user profile information in the response
    res.json({
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl || '',
      bio: user.bio || '',
      telefono: user.telefono || '',
      citta: user.citta || ''
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await db.collection('User').findOne(
      { _id: parseInt(req.userId) },
      { projection: { password: 0 } } // Escludiamo la password
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user,
      eventiPartecipati: user.subscribedEvents.length,
      eventiOrganizzati: user.createdEvents.length
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = parseInt(req.userId);
    const { name, email, profileImageUrl, bio } = req.body;

    // Check if the user exists
    const user = await db.collection('User').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) {
      // Optional: Add validation for email uniqueness if email is being changed
      const existingUserWithEmail = await db.collection('User').findOne({ email });
      if (existingUserWithEmail && existingUserWithEmail._id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateFields.email = email;
    }
    if (profileImageUrl !== undefined) updateFields.profileImageUrl = profileImageUrl;
    if (bio !== undefined) updateFields.bio = bio;

    // Perform update if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      const result = await db.collection('User').updateOne(
        { _id: userId },
        { $set: { ...updateFields, ...getTimestamps('update') } }
      );

      if (result.modifiedCount === 0) {
        // No fields were actually changed or user not found (should be caught by findOne)
        // This might happen if the submitted data is the same as current data
        console.log('User profile update: No modifications made or user not found for id:', userId);
      }
    }

    // Fetch and return the updated user profile
    const updatedUser = await db.collection('User').findOne(
      { _id: userId },
      { projection: { password: 0 } } // Exclude password
    );

    res.json(updatedUser);

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: "Error updating user profile" });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = parseInt(req.userId);

    // Get user's events
    const user = await db.collection('User').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all events created by the user
    await db.collection('Event').deleteMany({ creator: userId });

    // Remove user from all events they're participating in
    await db.collection('Event').updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );

    // Delete user's notifications
    await db.collection('Notification').deleteMany({ user: userId });

    // Finally, delete the user
    await db.collection('User').deleteOne({ _id: userId });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: "Error deleting account" });
  }
});

export default router;