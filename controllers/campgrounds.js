const Campground = require('../models/campgroud');

// ========== CREATE ========== //
exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

exports.create = async (req, res) => {
  const newCamp = new Campground(req.body.campground);
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

  req.flash('success', 'Campground Successfully updated');
  res.redirect(`/campgrounds/${req.params._id}`);
};

// ============= DELEtE ============ //
exports.delete = async (req, res) => {
  await Campground.findByIdAndDelete(req.params._id, req.body.ampground);

  req.flash('success', 'campground successfully deleted');
  res.redirect('/campgrounds');
};
