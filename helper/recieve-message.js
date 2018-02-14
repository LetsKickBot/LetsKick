const
  	bodyParser = require('body-parser'),
  	request = require('request'),
	Data = require('./utils/get_data');

const handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  console.log(received_message.text);
  Data.get_next_game(received_message.text, (reply) => {
      if (received_message.text) {    
        let date = new Date(reply[2]);
        let newDate = ("" + date);
      // Create the payload for a basic text message
      response = {
        "text": `${reply[0]} will play again ${reply[1]} on ${newDate}`
      }
    }  
  
    // Sends the response message
    callSendAPI(sender_psid, response);
  })
    
}

const callSendAPI(sender_psid, response) {
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