if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const methodOverrided = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStartegy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

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
const userRoutes = require('./routes/users');
const campgroudRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// express server
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverrided('_method'));
app.use(
  session({
    name: 'S__ID',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(helmet());
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/`,
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

passport.use(new LocalStartegy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// set the view engine to ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.use(express.static('public'));

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = req.flash();
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

// Routes
app.use('/campgrounds', campgroudRoutes);
app.use('/campgrounds/:camp_id/reviews', reviewRoutes);
app.use('/', userRoutes);

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
