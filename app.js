require('dotenv').config();
const methodOverrided = require('method-override');

//db connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Database connected ...`);
});

const Campground = require('./models/campgroud');

// express server
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverrided('_method'));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.get('/', (req, res) => {
  res.render('home');
});

//CRUD
//Create
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
  await Campground.create(req.body.campground);
  res.redirect('/campgrounds');
});

//Read All
app.get('/campgrounds', async (req, res) => {
  const allCamps = await Campground.find();
  res.render('campgrounds/index', { allCamps });
});

//Read one
app.get('/campgrounds/:_id', async (req, res) => {
  const camp = await Campground.findById(req.params._id);
  res.render('campgrounds/show', { camp });
});

//Update
app.get('/campgrounds/:_id/edit', async (req, res) => {
  const camp = await Campground.findById(req.params._id);
  res.render('campgrounds/edit', { camp });
});

app.put('/campgrounds/:_id', async (req, res) => {
  await Campground.findByIdAndUpdate(req.params._id, req.body.campground);
  res.redirect(`/campgrounds/${req.params._id}`);
});

//Delete
app.delete('/campgrounds/:_id', async (req, res) => {
  await Campground.findByIdAndDelete(req.params._id, req.body.ampground);
  res.redirect('/campgrounds');
});

app.listen(3000, () => {
  console.log(`Listening on Port 3000`);
});
