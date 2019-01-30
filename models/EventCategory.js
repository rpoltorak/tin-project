const mongoose = require('mongoose');

const eventCategorySchema = new mongoose.Schema({
  name: String,
  description: String
});

const EventCategory = mongoose.model('EventCategory', eventCategorySchema);

module.exports = EventCategory;
