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

  for (let i = 0; i < 10; i++) {
    const price = Math.floor(Math.random() * 20) + 10;
    const newCamp = new Campground({
      author: '64c81a063c5733ebaecc6ee3', //initial ussr @test
      title: `${rand(descriptors)} ${rand(places)}`,
      location: `${rand(cities).city}, ${rand(cities).state}`,
      image: `https://source.unsplash.com/collection/483251`,
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quos quidem vitae dicta porro fuga asperiores, et quas! Beatae optio necessitatibus neque mollitia nulla molestias officiis, ipsa qui magnam minima!`,
      price: price,
    });
    await newCamp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
