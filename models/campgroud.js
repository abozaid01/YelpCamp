const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { cloudinary } = require('../cloudinary');

const opts = { toJSON: { virtuals: true } };

const imgSchema = new Schema({
  url: String,
  filename: String,
});
imgSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200,h_200');
});

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const CampgroundScema = new Schema(
  {
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: PointSchema,
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
  },
  opts
);

CampgroundScema.virtual('properties.popUpMarkUp').get(function () {
  return `
  <strong>
    <a style="text-decoration:none;" target = "_blank" href="/campgrounds/${
      this._id
    }">
      ${this.title} 
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>

    </a>
  </strong>
  <p>${this.description.substring(0, 25)}...</p>`;
});

CampgroundScema.post('findOneAndDelete', async doc => {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });

    for (const img of doc.images)
      await cloudinary.uploader.destroy(img.filename);
  }
});

module.exports = mongoose.model('Campground', CampgroundScema);
