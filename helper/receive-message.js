const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  func = require('./function')

let PAGE_ACCESS_TOKEN = "EAACChvEnROQBAFZA0OZBs4tBRU8oeTVtNSl2TbmIkikmGUZAWFddfJVIRSzMui4qEzskD5VljnrpYgbCR0KULaKPXwD7vPjLQ4X3WgsH9bvjy6LIkjYY4ZBZAZCwVnZBULNAj5sqBOYT4p8A5XklNXETYLFt5cfauKgAgTgTMaSZCOjhJOmYiwca";

const handleMessage = (sender_psid, received_message, timestamp) => {

  let response;


  let key = func.checkSpell(received_message.text);

  let newTime = new Date(timestamp)

  console.log(key)

  // Check if the message contains text
  if (key == "") {
    response = {
      "text": `We cannot find your team, please give us another one!`
    }
    callSendAPI(sender_psid, response);
  } else {
    response = {
      "text": `Please wait, we are retrieving information for ${key}...`
    };
    callSendAPI(sender_psid, response);
    Data.get_next_game(key, (reply) => {
        if (key) {
          let time = func.timeFormat(reply[2])
          let info = reply[3];
          let a = newTime.getHours()
          console.log(a)
        // Create the payload for a basic text message
        response = {
          "text": `${reply[0]} will play against ${reply[1]} on ${newTime} or ${time} and ${a} or, for ${info}`
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
    // Test
    // "uri": "http://localhost:3100/v2.6",

    // Try to add the access_token to the enviromental variable instead of embedding it into the code like this.
    "qs": { "access_token": PAGE_ACCESS_TOKEN},
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    // Test
    console.log(body.timezone)
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
