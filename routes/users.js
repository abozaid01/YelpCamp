const userController = require('../controllers/users');
const { storeReturnTo } = require('../utils/middlewares');

const express = require('express');
const passport = require('passport');
const router = express.Router();

router
  .route('/register')
  .get(userController.renderRegister)
  .post(userController.signUp);

router
  .route('/login')
  .get(userController.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    userController.logIn
  );

router.get('/logout', userController.logOut);

module.exports = router;
