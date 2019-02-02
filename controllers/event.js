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
      Event
        .find()
        .populate('category')
        .exec((error, events) => {
          if (error) {
            res.status(500).send('500: Internal server error');
          }
          callback(null, events);
      });
    }
  }, (error, results) => {
    if (error) {
      res.status(500).send('500: Internal server error');
    }

    const { categories, events } = results;

    res.render('event/list', {
      title: 'Events',
      userId: req.user ? req.user._id : null,
      categories,
      events,
      isInAttendees: (event) => {
        return event.attendees.some((attendee) => attendee.equals(req.user._id));
      }
    });
  });
};

exports.getAddEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  EventCategory.find().then((categories) => {
    res.render('event/add', {
      categories,
      user: req.user
    });
  });
};

exports.postAddEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

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
    category: category,
    creator: req.user._id,
    attendees: []
  }).then(() => res.redirect('/'));
};

exports.postRemoveEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  Event.findOne({ _id: req.body.id }).then((event) => {
    if (event.creator.toString() === req.user._id.toString()) {
      event.remove(() => res.redirect('/'));
    } else {
      res.status(401).send('401: Unauthorized');
    }
  });
};

exports.getEditEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  Event.findOne({ _id: req.params.id }).then((event) => {
    console.log('event', JSON.stringify(event));
    if (event) {
      if (event.creator.toString() === req.user._id.toString()) {
        res.render('event/edit', {
          event
        });
      } else {
        res.status(401).send('401: Unauthorized');
      }
    } else {
      res.status(401).send('404: Not found');
    }
  });
};

exports.postEditEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

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
        res.status(401).send('401: Unauthorized');
      }
    } else {
      res.status(404).send('404: Not found');
    }
  });
};

exports.getEventDetails = (req, res) => {
  Event.findOne({
    _id: req.params.id,
  })
  .populate('category')
  .populate('creator')
  .populate('attendees')
    .exec((error, event) => {
      if (error) {
        res.status(500).send('500: Internal server error');
      }

      if (event) {
        res.render('event/details', {
          event
        });
      } else {
        res.status(404).send('404: Not found');
      }
    });
};

exports.getCreatedEvents = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  Event
    .find({
      creator: req.user._id
    })
    .populate('category')
    .exec((error, events) => {
      if (error) {
        res.status(500).send('500: Internal server error');
      }

      res.render('event/created', {
        events,
        userId: req.user._id
      });
    });
};

exports.getEventsByCategory = (req, res) => {
  async.series({
    category: (callback) => {
      EventCategory.findOne({
        _id: req.params.id
      }).then((category) => {
        callback(null, category);
      });
    },
    events: (callback) => {
      Event
        .find({
          category: req.params.id
        })
        .populate('category')
        .exec((error, events) => {
          callback(null, events);
        });
    }
  }, (error, results) => {
    if (error) {
      res.status(500).send('500: Internal server error');
    }

    const { category, events } = results;

    res.render('event/category', {
      events,
      category
    });
  });
};

exports.attendToEvent = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  Event.findOne({ _id: req.body.id }).then((event) => {
    if (event) {
      const isInAttendees = event.attendees.some((attendee) => attendee.equals(req.user._id));

      if (isInAttendees) {
        res.status(500).send('You are already an attendee of this event');
      }

      event.updateOne({
        "$push": { attendees: req.user._id }
      }).then(() => res.redirect('/'));
    } else {
      res.status(404).send('404: Not found');
    }
  });
};

exports.getOnGoingEvents = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  Event
    .find({
      attendees: {
        "$in": req.user._id
      }
    })
    .populate('category')
    .exec((error, events) => {
      if (error) {
        res.status(500).send('500: Internal server error');
      }

      res.render('event/ongoing', {
        events
      });
    });
};

