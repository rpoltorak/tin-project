const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  location: String,
  date: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventCategory'
  },
  description: String,
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
