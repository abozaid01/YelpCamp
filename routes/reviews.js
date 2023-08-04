const Review = require('../models/review');
const Campground = require('../models/campgroud');
const catchAsync = require('../utils/catchAsync');
const {
  isLoggedIn,
  validateReview,
  isReviewAuthorized,
} = require('../utils/middlewares');

const express = require('express');
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res, next) => {
    const campgroud = await Campground.findById(req.params.camp_id);

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campgroud.reviews.push(newReview);

    await newReview.save();
    await campgroud.save();

    req.flash('success', 'new review successfully created');
    res.redirect(`/campgrounds/${campgroud._id}`);
  })
);

router.delete(
  '/:review_id',
  isLoggedIn,
  isReviewAuthorized,
  catchAsync(async (req, res, next) => {
    const { camp_id, review_id } = req.params;

    const camp = await Campground.findByIdAndUpdate(camp_id, {
      $pull: { reviews: review_id },
    });
    const rev = await Review.findByIdAndDelete(review_id);

    req.flash('success', 'review successfully deleted');
    res.redirect(`/campgrounds/${camp_id}`);
  })
);

module.exports = router;
