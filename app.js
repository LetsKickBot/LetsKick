//'use strict';
// Imports dependencies and set up http server
const
  	request = require('request'),
  	express = require('express'),
  	bodyParser = require('body-parser'),
  	app = express(),
  	webhooks = require('./routes/webhooks'),
  	Rx = require('rxjs/Rx');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
  console.log('webhook is listening');
});

app.use(bodyParser.json());

app.use('/webhook', webhooks);

module.exports = app;
