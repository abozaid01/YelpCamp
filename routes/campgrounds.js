const Campground = require('../models/campgroud');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { campgroudSchema } = require('./../utils/schemas');

const express = require('express');
const router = express.Router();

const validateCampground = (req, res, next) => {
  const { error } = campgroudSchema.validate(req.body);
  if (error) throw new ExpressError(error.message, 400);

  next();
};

//Create
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res) => {
    const newCamp = await Campground.create(req.body.campground);

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
    const camp = await Campground.findById(req.params._id).populate('reviews');
    res.render('campgrounds/show', { camp });
  })
);

//Update
router.get(
  '/:_id/edit',
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params._id);
    res.render('campgrounds/edit', { camp });
  })
);

router.put(
  '/:_id',
  validateCampground,
  catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params._id, req.body.campground);
    res.redirect(`/campgrounds/${req.params._id}`);
  })
);

//Delete
router.delete(
  '/:_id',
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params._id, req.body.ampground);
    res.redirect('/campgrounds');
  })
);

module.exports = router;
