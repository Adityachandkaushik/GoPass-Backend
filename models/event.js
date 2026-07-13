const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  host: {
    type: String,
    required: [true, 'Host name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['One-Day', 'Multi-Day'],
    default: 'One-Day',
    required: true
  },
  startDate: {
    type: String, // Storing as YYYY-MM-DD string as per frontend input
    required: true
  },
  endDate: {
    type: String,
    required: true // Even for one-day, we can store same date as start
  },
  startTime: {
    type: String,
    required: false
  },
  endTime: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Running', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;