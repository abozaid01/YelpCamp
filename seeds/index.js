require('dotenv').config();

//db connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Database connected ...`);
});

const Campground = require('../models/campgroud');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

//seeding the DB
seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const newCamp = new Campground({
      title: `${rand(descriptors)} ${rand(places)}`,
      location: `${rand(cities).city}, ${rand(cities).state}`,
    });
    await newCamp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
