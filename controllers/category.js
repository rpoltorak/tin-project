const EventCategory = require('../models/EventCategory.js');

exports.index = (req, res) => {
  EventCategory.find().then((categories) => {
    res.render('category/list', {
      title: 'Categories',
      userId: req.user._id,
      categories,
    });
  });
};

exports.getAddCategory = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  res.render('category/add');
};

exports.postAddCategory = (req, res) => {
  if (!req.user) {
    res.status(401).send('401: Unauthorized');
  }

  req.assert('name', 'Name cannot be empty').notEmpty();
  req.assert('description', 'Description cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/categories/add');
  }

  const {
    name,
    description
  } = req.body;

  EventCategory.create({
    name,
    description
  }).then(() => res.redirect('/'));
};
