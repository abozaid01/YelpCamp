const express = require('express');
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(3000, () => {
  console.log(`Listening on Port 3000`);
});
