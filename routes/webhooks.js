const
    bodyParser = require('body-parser'),
    express = require('express');
    recieve = require('../helper/receive-message');

const router = express.Router();

router.post('/', (req, res) => {

  // Parses the request body from the POST
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      let user_message = webhook_event.message.text;

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      // Get the postback value
      let postBackValue = webhook_event.messaging_postbacks.text;
      recieve.handleButtonCall(sender_psid, postBackValue);

      // Checks if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        recieve.handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        recieve.handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
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