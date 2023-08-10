const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { cloudinary } = require('../cloudinary');

const imgSchema = new Schema({
  url: String,
  filename: String,
});
imgSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200,h_200');
});

const CampgroundScema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  images: [imgSchema],
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
