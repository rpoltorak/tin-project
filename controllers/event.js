const async = require('async');
const Event = require('../models/Event.js');
const EventCategory = require('../models/EventCategory.js');

exports.index = (req, res) => {
  async.series({
    categories: (callback) => {
      EventCategory.find().then((categories) => {
        callback(null, categories);
      });
    },
    events: (callback) => {
      Event.find().then((events) => {
        callback(null, events);
      });
    }
  }, (error, results) => {
    const { categories, events } = results;
    res.render('event/list', {
      title: 'Events',
      categories,
      events
    });
  });
};

exports.getAddEvent = (req, res) => {
  res.render('event/add');
};

exports.postAddEvent = (req, res) => {
  req.assert('name', 'Name cannot be empty').notEmpty();
  req.assert('description', 'Description cannot be empty').notEmpty();
  req.assert('date', 'Date cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/events/add');
  }

  const { name, description, date } = req.body;

  Event.create({ name, description, date }).then(() => res.redirect('/events'));
};

exports.postRemoveEvent = (req, res) => {
  Event.findOneAndDelete({ _id: req.body.id }).then(() => res.redirect('/events'));
};
