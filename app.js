//'use strict';
//import Data from './utils/get_data';

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express()

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
