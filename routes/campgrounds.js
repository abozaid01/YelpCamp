const campController = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const {
  isLoggedIn,
  isAuthorized,
  validateCampground,
} = require('../utils/middlewares');
const { storage } = require('../cloudinary/index');

const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ storage });

router
  .route('/')
  .get(catchAsync(campController.index))
  .post(
    isLoggedIn,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(campController.create)
  );

router.get('/new', isLoggedIn, campController.renderNewForm);

router
  .route('/:_id')
  .get(catchAsync(campController.show))
  .put(
    isLoggedIn,
    isAuthorized,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(campController.update)
  )
  .delete(isLoggedIn, isAuthorized, catchAsync(campController.delete));

router.get(
  '/:_id/edit',
  isLoggedIn,
  isAuthorized,
  catchAsync(campController.renderEditForm)
);

module.exports = router;
