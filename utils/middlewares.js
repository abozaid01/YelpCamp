const Campground = require('../models/campgroud');
const ExpressError = require('./ExpressError');
const { campgroudSchema } = require('./schemas');

exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be Signed in');
    return res.redirect('/login');
  }
  next();
};

exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) res.locals.returnTo = req.session.returnTo;
  next();
};

exports.isAuthorized = async (req, res, next) => {
  const camp = await Campground.findById(req.params._id);
  if (!camp.author._id.equals(req.user?._id)) {
    req.flash('error', "You Don't have Permissions");
    return res.status(403).redirect(`/campgrounds/${req.params._id}`);
  }
  next();
};

exports.validateCampground = (req, res, next) => {
  const { error } = campgroudSchema.validate(req.body);
  if (error) throw new ExpressError(error.message, 400);

  next();
};
