require('dotenv').config();
const methodOverrided = require('method-override');
const ejsMate = require('ejs-mate');

//db connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Database connected ...`);
});

const Campground = require('./models/campgroud');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroudSchema, reviewSchema } = require('./utils/schemas');

// express server
const express = require('express');
const review = require('./models/review');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverrided('_method'));

// set the view engine to ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home');
});

const validateCampground = (req, res, next) => {
  const { error } = campgroudSchema.validate(req.body);
  if (error) throw new ExpressError(error.message, 400);

  next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) throw new ExpressError(error.message, 400);

  next();
};

//CRUD
//Create
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res) => {
    const newCamp = await Campground.create(req.body.campground);

    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

//Read All
app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const allCamps = await Campground.find();
    res.render('campgrounds/index', { allCamps });
  })
);

//Read one
app.get(
  '/campgrounds/:_id',
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params._id).populate('reviews');
    res.render('campgrounds/show', { camp });
  })
);

//Update
app.get(
  '/campgrounds/:_id/edit',
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params._id);
    res.render('campgrounds/edit', { camp });
  })
);

app.put(
  '/campgrounds/:_id',
  validateCampground,
  catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params._id, req.body.campground);
    res.redirect(`/campgrounds/${req.params._id}`);
  })
);

//Delete
app.delete(
  '/campgrounds/:_id',
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params._id, req.body.ampground);
    res.redirect('/campgrounds');
  })
);

//Reviews Routes
app.post(
  '/campgrounds/:camp_id/reviews',
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

app.delete(
  '/campgrounds/:camp_id/reviews/:review_id',
  catchAsync(async (req, res, next) => {
    const { camp_id, review_id } = req.params;

    const camp = await Campground.findByIdAndUpdate(camp_id, {
      $pull: { reviews: review_id },
    });
    const rev = await Review.findByIdAndDelete(review_id);

    res.redirect(`/campgrounds/${camp_id}`);
  })
);

// 404
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something Went Wrong' } = err;
  if (!err.message) err.message = message;
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log(`Listening on Port 3000`);
});
