const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  func = require('./function')

const handleMessage = (sender_psid, received_message) => {

  let response;

  // Check if the message contains text
  console.log(received_message.text);

  let key = func.checkSpell(received_message.text);

  if (key == "") {
    response = {
      "text": `We cannot find your team, please give us another one!`
    }
    callSendAPI(sender_psid, response);
  } else {
    Data.get_next_game(key, (reply) => {
        if (key) {
          let date = reply[2];
          let time = reply[3];
          let info = reply[4];
        // Create the payload for a basic text message
        response = {
          "text": `${reply[0]} will play against ${reply[1]} on ${date}, ${time}, for ${info}`
        }
      }

      // Sends the response message
      callSendAPI(sender_psid, response);
    })
  }
}

const callSendAPI = (sender_psid, response) => {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",

    // Try to add the access_token to the enviromental variable instead of embedding it into the code like this.
    "qs": { "access_token": 'EAACChvEnROQBAFZA0OZBs4tBRU8oeTVtNSl2TbmIkikmGUZAWFddfJVIRSzMui4qEzskD5VljnrpYgbCR0KULaKPXwD7vPjLQ4X3WgsH9bvjy6LIkjYY4ZBZAZCwVnZBULNAj5sqBOYT4p8A5XklNXETYLFt5cfauKgAgTgTMaSZCOjhJOmYiwca' },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function handlePostback (sender_psid, received_postback) {

}

module.exports = {
  handleMessage,
  callSendAPI,
  handlePostback
};
