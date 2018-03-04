const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data');


const handleMessage = (sender_psid, received_message) => {

  let response;

  // Check if the message contains text
  console.log(received_message.text);
  Data.get_next_game(received_message.text, (err, reply) => {
      if (err) {
        response = {
          "text": "Something went wrong. Please try again"
        }
        console.log("Error with getting data: " + err.stack);
      } else if (received_message.text) {
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

    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
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
