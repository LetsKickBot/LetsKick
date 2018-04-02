const bodyParser = require('body-parser');
const express = require('express');
const receive = require('../functions/receive-message');

const router = express.Router();

router.post('/', (req, res) => {

  // Parses the request body from the POST
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message
      let webhook_event = entry.messaging[0];

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      // Handle quick reply buttons
      if (webhook_event.message.quick_reply) {
        receive.handleQuickReply(sender_psid, webhook_event.message);

      // Handle Direct Message
      } else if (webhook_event.message) {
        receive.handleMessage(sender_psid, webhook_event.message);

      // Handle Postback
      } else if (webhook_event.postback) {
        receive.handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');

  } else {
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
router.get('/', (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>";

  // Parses the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

module.exports = router;
