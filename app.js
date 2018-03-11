//'use strict';
//import Data from './utils/get_data';

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  webhooks = require('./routes/webhooks');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
  console.log('webhook is listening')
});

app.use('/webhooks', webhooks)

module.exports = app;


