//'use strict';
// Imports dependencies and set up http server
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const webhooks = require('./routes/webhooks');

// endpoint
app.get('/', (req, res) => {
  res.send('Server ON!');
})

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {

  console.log('webhook is listening on port ', process.env.PORT || 1337);
  
});

app.use(bodyParser.json());

app.use('/webhook', webhooks);

module.exports = app;
