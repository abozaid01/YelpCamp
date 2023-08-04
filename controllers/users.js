const User = require('../models/user');

// ============ Sign Up ============ //
exports.renderRegister = (req, res) => {
  res.render('users/register');
};

exports.signUp = async (req, res, next) => {
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
};

// ========== Login ============== //
exports.renderLogin = (req, res) => {
  res.render('users/login');
};

exports.logIn = (req, res) => {
  let redirectTo = res.locals.returnTo || '/campgrounds';

  const regex = /\b\w*method\w*\b/i;
  if (regex.test(res.locals.returnTo)) redirectTo = '/campgrounds';

  req.flash('success', 'Welcome Back');
  res.redirect(redirectTo);
};

// ============ Logout ============ //
exports.logOut = (req, res, next) => {
  req.logOut({}, err => {
    if (err) return next(err);
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
  });
};
