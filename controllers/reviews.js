const Review = require('../models/review');
const Campground = require('../models/campgroud');

// ========== CREATE ========== //
exports.create = async (req, res, next) => {
  const campgroud = await Campground.findById(req.params.camp_id);

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  campgroud.reviews.push(newReview);

  await newReview.save();
  await campgroud.save();

  req.flash('success', 'new review successfully created');
  res.redirect(`/campgrounds/${campgroud._id}`);
};

// ============= DELEtE ============ //
exports.delete = async (req, res, next) => {
  const { camp_id, review_id } = req.params;

  await Campground.findByIdAndUpdate(camp_id, {
    $pull: { reviews: review_id },
  });
  await Review.findByIdAndDelete(review_id);

  req.flash('success', 'review successfully deleted');
  res.redirect(`/campgrounds/${camp_id}`);
};
