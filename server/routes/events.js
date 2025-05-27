import express from 'express';
import auth from '../middleware/auth.js';
import { getNextSequence, getTimestamps, updateTimestamp } from '../utils/db.js';

const router = express.Router();

// Get all events with filters
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search, category, city, date, status } = req.query;
    
    let query = { isPublic: true };
    
    // Filtro per ricerca testuale
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro per categoria
    if (category) {
      query.category = category;
    }
    
    // Filtro per città
    if (city) {
      query.location = { $regex: `^${city}`, $options: 'i' };
    }
    
    // Filtro per data
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Filtro per stato
    if (status) {
      query.state = status;
    }
    
    const events = await db.collection('Event')
      .find(query)
      .sort({ date: 1 })
      .toArray();
    
    // Populate creator information
    const populatedEvents = await Promise.all(events.map(async (event) => {
      const creator = await db.collection('User').findOne(
        { _id: event.creator },
        { projection: { name: 1, _id: 1 } }
      );
      return { 
        ...event, 
        creator: {
          id: creator?._id,
          nome: creator?.name
        },
        id: event._id.toString(),
        titolo: event.title,
        data: event.date.toString(),
        luogo: event.location,
        categoria: event.category,
        immagine: event.image || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        numeroPartecipanti: event.participants?.length || 0,
        organizzatore: {
          id: creator?._id,
          nome: creator?.name || 'Organizzatore'
        }
      };
    }));
    
    res.json(populatedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = await getNextSequence(db, 'Event');
    
    const event = {
      _id: eventId,
      ...req.body,
      creator: req.userId,
      participants: [],
      ...getTimestamps()
    };

    await db.collection('Event').insertOne(event);
    await db.collection('User').updateOne(
      { _id: req.userId },
      { $push: { createdEvents: eventId } }
    );

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const event = await db.collection('Event').findOne({ _id: parseInt(req.params.id) });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Populate creator and participants with more details
    const creator = await db.collection('User').findOne(
      { _id: event.creator },
      { projection: { name: 1, avatar: 1 } }
    );
    
    const participants = await db.collection('User')
      .find(
        { _id: { $in: event.participants } },
        { projection: { name: 1, avatar: 1 } }
      )
      .toArray();

    // Format the response to match the frontend interface
    const formattedEvent = {
      ...event,
      creator: creator ? {
        id: creator._id,
        nome: creator.name,
        avatar: creator.avatar
      } : null,
      participants: participants.map(p => ({
        id: p._id,
        nome: p.name,
        avatar: p.avatar
      })),
      title: event.title || event.titolo,
      description: event.description || event.descrizione,
      location: event.location || event.luogo,
      category: event.category || event.categoria,
      date: event.date || event.data,
      imageUrl: event.imageUrl || event.immagine,
      maxParticipants: event.maxParticipants || event.maxPartecipanti,
      organizzatore: creator ? {
        id: creator._id,
        nome: creator.name
      } : null
    };
    
    res.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = parseInt(req.params.id);
    
    // Validate eventId
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await db.collection('Event').findOne({ _id: eventId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.creator !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate required fields
    const { title, description, category, date, location, state } = req.body;
    if (!title || !description || !category || !date || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate state if provided
    if (state && !['bozza', 'pubblicato', 'concluso', 'annullato'].includes(state)) {
      return res.status(400).json({ message: "Invalid event status" });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      date: new Date(date), // Ensure date is stored as Date object
      state: state || event.state || 'bozza', // Keep existing status if not provided
      ...updateTimestamp()
    };

    // Update the event
    const result = await db.collection('Event').findOneAndUpdate(
      { _id: eventId },
      { $set: updateData },
      { 
        returnDocument: 'after'
      }
    );

    // Get the updated document
    const updatedEvent = result.value || await db.collection('Event').findOne({ _id: eventId });
    
    if (!updatedEvent) {
      return res.status(500).json({ message: "Failed to update event" });
    }

    // Format the response
    const formattedEvent = {
      ...updatedEvent,
      id: updatedEvent._id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      category: updatedEvent.category,
      date: updatedEvent.date.toISOString(),
      location: updatedEvent.location,
      imageUrl: updatedEvent.imageUrl,
      maxParticipants: updatedEvent.maxParticipants,
      isPublic: updatedEvent.isPublic,
      state: updatedEvent.state
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: "Error updating event" });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = parseInt(req.params.id);
    const event = await db.collection('Event').findOne({ _id: eventId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.creator !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection('Event').deleteOne({ _id: eventId });
    await db.collection('User').updateMany(
      { 
        $or: [
          { createdEvents: eventId },
          { subscribedEvents: eventId }
        ]
      },
      { 
        $pull: { 
          createdEvents: eventId,
          subscribedEvents: eventId
        }
      }
    );

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

// Join event
router.post('/:id/join', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = parseInt(req.params.id);
    const event = await db.collection('Event').findOne({ _id: eventId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(req.userId)) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    await db.collection('Event').updateOne(
      { _id: eventId },
      { 
        $push: { participants: req.userId },
        $set: { ...updateTimestamp() }
      }
    );

    await db.collection('User').updateOne(
      { _id: req.userId },
      { $push: { subscribedEvents: eventId } }
    );

    res.json({ message: "Successfully joined event" });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ message: "Error joining event" });
  }
});

// Leave event
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = parseInt(req.params.id);
    const event = await db.collection('Event').findOne({ _id: eventId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.participants.includes(req.userId)) {
      return res.status(400).json({ message: "Not joined this event" });
    }

    await db.collection('Event').updateOne(
      { _id: eventId },
      { 
        $pull: { participants: req.userId },
        $set: { ...updateTimestamp() }
      }
    );

    await db.collection('User').updateOne(
      { _id: req.userId },
      { $pull: { subscribedEvents: eventId } }
    );

    res.json({ message: "Successfully left event" });
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ message: "Error leaving event" });
  }
});

// Get events by category
router.get('/category/:category', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const events = await db.collection('Event')
      .find({
        category: req.params.category,
        isPublic: true
      })
      .sort({ date: 1 })
      .toArray();
    
    // Populate creator information
    const populatedEvents = await Promise.all(events.map(async (event) => {
      const creator = await db.collection('User').findOne(
        { _id: event.creator },
        { projection: { name: 1 } }
      );
      return { ...event, creator };
    }));
    
    res.json(populatedEvents);
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Get user's events
router.get('/user/events', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await db.collection('User').findOne({ _id: req.userId });
    
    const createdEvents = await db.collection('Event')
      .find({ _id: { $in: user.createdEvents } })
      .toArray();
      
    const subscribedEvents = await db.collection('Event')
      .find({ _id: { $in: user.subscribedEvents } })
      .toArray();
    
    res.json({
      createdEvents,
      subscribedEvents
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: "Error fetching user events" });
  }
});

// Get event categories
router.get('/categories', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const categories = await db.collection('Event')
      .distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Get event cities
router.get('/cities', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const locations = await db.collection('Event')
      .distinct('location');
    
    // Estraggo solo le città (prima parte della location)
    const cities = [...new Set(locations.map(loc => loc.split(',')[0]))];
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: "Error fetching cities" });
  }
});

// Get organizer profile and events
router.get('/organizer/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const organizerId = parseInt(req.params.id);
    console.log('Fetching organizer profile for ID:', organizerId);
    
    // Get organizer info
    const organizer = await db.collection('User').findOne(
      { _id: organizerId },
      { projection: { name: 1, profileImageUrl: 1, bio: 1, email: 1, website: 1, phone: 1 } }
    );
    
    if (!organizer) {
      console.log('Organizer not found for ID:', organizerId);
      return res.status(404).json({ message: "Organizer not found" });
    }

    console.log('Found organizer:', organizer);

    // Get events organized by this user
    const events = await db.collection('Event')
      .find({ creator: organizerId })
      .sort({ date: -1 })
      .toArray();

    console.log('Found events for organizer:', events.length);

    // Format the response
    const formattedResponse = {
      id: organizer._id,
      nome: organizer.name,
      profileImageUrl: organizer.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(organizer.name)}`,
      bio: organizer.bio || 'Nessuna biografia disponibile',
      contatti: {
        email: organizer.email,
        telefono: organizer.phone,
        website: organizer.website
      },
      eventiOrganizzati: events.map(event => ({
        id: event._id.toString(),
        titolo: event.title,
        descrizione: event.description,
        categoria: event.category,
        data: event.date,
        dataFine: event.time || event.date,
        luogo: event.location,
        indirizzo: event.indirizzo || event.location,
        immagine: event.imageUrl,
        numeroPartecipanti: event.participants.length,
        organizzatore: {
          id: organizer._id,
          nome: organizer.name,
          profileImageUrl: organizer.profileImageUrl
        },
        prezzo: event.prezzo || 0,
        maxPartecipanti: event.maxParticipants,
        partecipanti: event.participants
      }))
    };
    
    res.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching organizer profile:', error);
    res.status(500).json({ message: "Error fetching organizer profile" });
  }
});

export default router;