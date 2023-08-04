const Campground = require('../models/campgroud');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const {
  isLoggedIn,
  isAuthorized,
  validateCampground,
} = require('../utils/middlewares');

const express = require('express');
const router = express.Router();

//Create
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    await newCamp.save();

    req.flash('success', 'new Campground Successfully created');
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

//Read All
router.get(
  '/',
  catchAsync(async (req, res) => {
    const allCamps = await Campground.find();
    res.render('campgrounds/index', { allCamps });
  })
);

//Read one
router.get(
  '/:_id',
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params._id)
      .populate('reviews')
      .populate('author');
    if (!camp) {
      // throw new ExpressError('campground not found!!', 404);
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { camp });
  })
);

//Update
router.get(
  '/:_id/edit',
  isLoggedIn,
  isAuthorized,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params._id);
    if (!camp) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    } else res.render('campgrounds/edit', { camp });
  })
);

router.put(
  '/:_id',
  isLoggedIn,
  isAuthorized,
  validateCampground,
  catchAsync(async (req, res) => {
    const camp = await Campground.findByIdAndUpdate(
      req.params._id,
      req.body.campground
    );
    if (!camp) throw new ExpressError('Campground Not Found', 404);

    req.flash('success', 'Campground Successfully updated');
    res.redirect(`/campgrounds/${req.params._id}`);
  })
);

//Delete
router.delete(
  '/:_id',
  isLoggedIn,
  isAuthorized,
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params._id, req.body.ampground);

    req.flash('success', 'campground successfully deleted');
    res.redirect('/campgrounds');
  })
);

module.exports = router;
