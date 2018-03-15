const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  func = require('./function')

const handleMessage = (sender_psid, received_message) => {

  let response;

  console.log(received_message.text);

  let key = func.checkSpell(received_message.text);

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
    Data.get_next_game(key, (err, reply) => {
        if (err) {
          response = {
            "text" : "Something went wrong. Please try again"
          }
        } else if (key) {
          let date = reply[2];
          let time = reply[3];
          let info = reply[4];
        // Create the payload for a basic text message
        response = {
          "text": `${reply[0]} (Home team) will play against ${reply[1]} (Away team) on ${date}, ${time}, for ${info}`
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
    "uri": "https://graph.facebook.com/v2.6",

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
