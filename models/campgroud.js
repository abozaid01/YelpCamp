const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { cloudinary } = require('../cloudinary');

const CampgroundScema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

CampgroundScema.post('findOneAndDelete', async doc => {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });

    for (const img of doc.images)
      await cloudinary.uploader.destroy(img.filename);
  }
});

module.exports = mongoose.model('Campground', CampgroundScema);
