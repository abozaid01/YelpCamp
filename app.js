require('dotenv').config();

//db connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Database connected ...`);
});

const Campground = require('./models/campgroud');

// express server
const express = require('express');
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/makecampgroudn', async (req, res) => {
  const camp = new Campground({ title: 'My Backyard' });
  await camp.save();
  res.send(camp);
});

app.listen(3000, () => {
  console.log(`Listening on Port 3000`);
});
