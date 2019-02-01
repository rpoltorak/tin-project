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
      userId: req.user._id,
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

  Event.create({
    name,
    description,
    date,
    creator: req.user._id
  }).then(() => res.redirect('/events'));
};

exports.postRemoveEvent = (req, res) => {
  Event.findOne({ _id: req.body.id }).then((event) => {
    if (event.creator.toString() === req.user._id.toString()) {
      event.remove(() => res.redirect('/events'));
    } else {
      res.status(403).send('403: Forbidden access');
    }
  });
};

exports.getEditEvent = (req, res) => {
  Event.findOne({ _id: req.params.id }).then((event) => {
    console.log('event', JSON.stringify(event));
    if (event) {
      if (event.creator.toString() === req.user._id.toString()) {
        res.render('event/edit', {
          event
        });
      } else {
        res.status(403).send('403: Forbidden access');
      }
    } else {
      res.status(404).send('404: Not found');
    }
  });
};

exports.postUpdateEvent = (req, res) => {
  req.assert('name', 'Name cannot be empty').notEmpty();
  req.assert('description', 'Description cannot be empty').notEmpty();
  req.assert('date', 'Date cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/events/add');
  }

  const {
    name,
    description,
    date
  } = req.body;

  Event.create({
    name,
    description,
    date,
    creator: req.user._id
  }).then(() => res.redirect('/events'));
};
