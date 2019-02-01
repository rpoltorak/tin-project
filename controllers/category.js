const EventCategory = require('../models/EventCategory.js');

exports.index = (req, res) => {
  EventCategory.find().then((categories) => {
    res.render('category/list', {
      title: 'Events',
      userId: req.user._id,
      categories,
    });
  });
};

exports.getAddCategory = (req, res) => {
  res.render('category/add');
};

exports.postAddCategory = (req, res) => {
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
  }).then(() => res.redirect('/categories'));
};
