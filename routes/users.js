const User = require('../models/user');
const { storeReturnTo } = require('../utils/middlewares');

const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    await User.register(user, password);
    req.logIn(user, err => {
      if (err) return next;

      req.flash('success', 'Welcome to YelpCamp');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post(
  '/login',
  storeReturnTo,
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    let redirectTo = res.locals.returnTo || '/campgrounds';

    const regex = /\b\w*method\w*\b/i;
    if (regex.test(res.locals.returnTo)) redirectTo = '/campgrounds';

    req.flash('success', 'Welcome Back');
    res.redirect(redirectTo);
  }
);

router.get('/logout', (req, res, next) => {
  req.logOut({}, err => {
    if (err) return next(err);
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
  });
});

module.exports = router;
