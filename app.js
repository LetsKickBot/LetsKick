//'use strict';
//import Data from './utils/get_data';

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express() // creates express http server
  webhook = require('./routes/webhooks');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
  console.log('webhook is listening')
});

app.use(bodyParser.json());
app.use('/webhooks', webhooks)
module.exports = app;

