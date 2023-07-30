const Review = require('../models/review');
const Campground = require('../models/campgroud');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('./../utils/schemas');

const express = require('express');
const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) throw new ExpressError(error.message, 400);

  next();
};

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res, next) => {
    const campgroud = await Campground.findById(req.params.camp_id);

    const newReview = new Review(req.body.review);
    campgroud.reviews.push(newReview);

    await newReview.save();
    await campgroud.save();

    res.redirect(`/campgrounds/${campgroud._id}`);
  })
);

router.delete(
  '/:review_id',
  catchAsync(async (req, res, next) => {
    const { camp_id, review_id } = req.params;

    const camp = await Campground.findByIdAndUpdate(camp_id, {
      $pull: { reviews: review_id },
    });
    const rev = await Review.findByIdAndDelete(review_id);

    res.redirect(`/campgrounds/${camp_id}`);
  })
);

module.exports = router;