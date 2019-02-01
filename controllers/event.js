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
  EventCategory.find().then((categories) => {
    res.render('event/add', {
      categories
    });
  });
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

  const {
    name,
    description,
    date,
    category
  } = req.body;

  Event.create({
    name,
    description,
    date,
    category,
    creator: req.user._id
  }).then(() => res.redirect('/'));
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

exports.postEditEvent = (req, res) => {
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

  Event.findOne({ _id: req.body.id }).then((event) => {
    if (event) {
      if (event.creator.toString() === req.user._id.toString()) {
        event.update({
          name,
          description,
          date,
          creator: req.user._id
        }).then(() => res.redirect('/'));
      } else {
        res.status(403).send('403: Forbidden access');
      }
    } else {
      res.status(404).send('404: Not found');
    }
  });
};

exports.getEventDetails = (req, res) => {
  Event.findOne({
    _id: req.params.id
  }).then((event) => {
    if (event) {
      res.render('event/details', {
        event
      });
    } else {
      res.status(404).send('404: Not found');
    }
  });
};

exports.getMyEvents = (req, res) => {
  Event.find({
    creator: req.user._id
  }).then((events) => {
    res.render('event/my', {
      events,
      userId: req.user._id
    });
  });
};

exports.getEventsByCategory = (req, res) => {
  Event.find({
    category: req.params.category
  }).then((events) => {
    res.render('event/category', {
      events,
      category: req.param.category
    });
  });
};
