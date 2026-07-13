const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');

// Route for getting all events and creating a new event
router.route('/')
  .get(getEvents)
  .post(createEvent);

// Route for updating and deleting a specific event by ID
router.route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;