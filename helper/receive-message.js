const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  task = require('./function')

const handleMessage = (sender_psid, received_message) => {
  let response;
  console.log(received_message.text);
  let key = task.checkSpellName(received_message.text);
  console.log(key);

  //Check if the key is in an array
  if(key.includes('or')){
    newKey = completeName(key)
    response = {
      "text": `Did you mean *${newKey}* ? Or please retype the team you want to see!!!`
    }
    callSendAPI1(sender_psid, response, key);
  // Check if the key is empty
  }else if (key == "") {
    response = {
      "text": `We cannot find your team, please give us another one!`
    }
    callSendAPI(sender_psid, response);
  // Check if the key contain a team
  } else {
    response = {
      "text": `\`\`\`\nPlease wait, we are retrieving information for ${key}...\n\`\`\``
    };
    console.log("waiting...");
    callSendAPI(sender_psid, response);
    Data.get_next_game(key, (err, reply) => {
        if (err) {
          response = {
            "text" : "Something went wrong. Please try again"
          }
        } else if (key) {
          request( {
            "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
            "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
            "method": "GET",
            "json": true,
          }, (err, res, body) => {
          // Test
            if (err) {
              console.error("Unable to send message:" + err);
            } else {
              let time = task.timeFormat(reply[2], body.timezone);
              let team = task.teamFormat(reply[0], reply[1], key);
            // Create the payload for a basic text message
              response = {
                "text": `${team[0]} will play against ${team[1]} on *${time}*, for ${reply[3]}.`
              }
              console.log("replied");
              callSendAPI(sender_psid, response); 
            }
        })
      }
    })
  }
}

const callSendAPI = (sender_psid, response) => {
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
    }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    // "uri": "http://localhost:3100/v2.6",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (err) {
      console.error("Unable to send message:" + err);
    }
  });
}

const callSendAPI1 = (sender_psid, response, value) => {
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": [
        {
          "content_type":"text",
          "title": value[0],
          "payload": "testing value"
        }, {
          "content_type":"text",
          "title": value[1],
          "payload": "testing value"
        }, {
          "content_type":"text",
          "title": value[2],
          "payload": "testing value"
        }, {
          "content_type":"text",
          "title": value[3],
          "payload": "testing value"
        }
      ]
    }
    }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    // "uri": "http://localhost:3100/v2.6",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (err) {
      console.error("Unable to send message:" + err);
    }
  });
}

function handlePostback (sender_psid, received_postback) {

}

module.exports = {
  handleMessage,
  callSendAPI,
  callSendAPI1,
  handlePostback
};