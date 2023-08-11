const Campground = require('../models/campgroud');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const campgroud = require('../models/campgroud');
const { query } = require('express');

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

// ========== CREATE ========== //
exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

exports.create = async (req, res) => {
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  req.body.campground.geometry = geoData.body.features[0].geometry;
  const newCamp = new Campground(req.body.campground);

  // newCamp.geometry = geoData.body.features[0].geometry;
  newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  newCamp.author = req.user._id;

  await newCamp.save();

  req.flash('success', 'new Campground Successfully created');
  res.redirect(`/campgrounds/${newCamp._id}`);
};

// ============ Read ============= //
exports.index = async (req, res) => {
  const allCamps = await Campground.find();
  res.render('campgrounds/index', { allCamps });
};

exports.show = async (req, res) => {
  console.log(req.query);
  const camp = await Campground.findById(req.params._id)
    .populate({ path: 'reviews', populate: { path: 'author' } }) //Nested Population
    .populate('author');
  if (!camp) {
    // throw new ExpressError('campground not found!!', 404);
    req.flash('error', 'Cannot find that campground');
    res.redirect('/campgrounds');
  }

  res.render('campgrounds/show', { camp });
};

// ============= UPDATE ============== //
exports.renderEditForm = async (req, res) => {
  const camp = await Campground.findById(req.params._id);
  if (!camp) {
    req.flash('error', 'Cannot find that campground');
    res.redirect('/campgrounds');
  } else res.render('campgrounds/edit', { camp });
};

exports.update = async (req, res) => {
  const camp = await Campground.findByIdAndUpdate(
    req.params._id,
    req.body.campground
  );
  if (!camp) {
    // throw new ExpressError('Campground Not Found', 404);
    req.flash('error', 'Cannot find that campground');
    res.redirect('/campgrounds');
  }

  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  camp.images.push(...imgs);
  await camp.save();

  if (req.body.deleteImgs) {
    for (const img of req.body.deleteImgs)
      await cloudinary.uploader.destroy(img);

    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImgs } } },
    });
  }
  req.flash('success', 'Campground Successfully updated');
  res.redirect(`/campgrounds/${req.params._id}`);
};

// ============= DELEtE ============ //
exports.delete = async (req, res) => {
  await Campground.findByIdAndDelete(req.params._id);

  req.flash('success', 'campground successfully deleted');
  res.redirect('/campgrounds');
};
