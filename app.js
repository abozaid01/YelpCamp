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

const ExpressError = require('./utils/ExpressError');
const campgroudRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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

// Routes
app.use('/campgrounds', campgroudRoutes);
app.use('/campgrounds/:camp_id/reviews', reviewRoutes);

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
