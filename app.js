require('dotenv').config();
const methodOverrided = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStartegy = require('passport-local');

//db connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Database connected ...`);
});

const ExpressError = require('./utils/ExpressError');
const UserModel = require('./models/user');
const campgroudRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// express server
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverrided('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStartegy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.get('/fakeUser', async (req, res) => {
  const user = new UserModel({ email: 'me@gmail.com', username: 'me' });
  const newUser = await UserModel.register(user, 'secretPassword');
  res.send(newUser);
});

// set the view engine to ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.use(express.static('public'));

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

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
