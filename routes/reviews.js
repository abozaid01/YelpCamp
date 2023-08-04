const reviewController = require('../controllers/reviews');
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
  catchAsync(reviewController.create)
);

router.delete(
  '/:review_id',
  isLoggedIn,
  isReviewAuthorized,
  catchAsync(reviewController.delete)
);

module.exports = router;
