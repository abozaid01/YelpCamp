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
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

// express server
const express = require('express');
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

//CRUD
//Create
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post(
  '/campgrounds',
  catchAsync(async (req, res) => {
    if (!req.body.campground)
      throw new ExpressError('Invalid Campground data', 400);
    console.log(req.body.campground);
    const newCamp = await Campground.create(req.body.campground);
    console.log(newCamp);

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
    const camp = await Campground.findById(req.params._id);
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

// 404
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something Went Wrong' } = err;
  res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log(`Listening on Port 3000`);
});
