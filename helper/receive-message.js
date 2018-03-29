const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  Player = require('../data/get_player'),
  task = require('./function')
  
let message = []

const handleMessage = (sender_psid, received_message) => {
  console.log("message: " + received_message.text);
  if (received_message.text == 'Teams') {
    message.push('Teams')
  } else {
    message.push('Players')
  }

  // Handle Get Started text message
  if ((received_message.text == 'Get Started') || (received_message.text == 'Begin') || (received_message.text == 'Start') || (received_message.text == 'Hello')) {
    message = []
    response = {
      "text": `Please select the options you want!!!`
    }
    console.log('Get Started')
    getStarted(sender_psid, response);

    // Handle Teams message
  } else if ((message[0] == 'Teams') || (task.checkSpellName(received_message.text) != "")) {
    console.log('holdValue:', message[0])
    if (received_message.text != 'Teams') {
      const key = task.checkSpellName(received_message.text)
      // message.push(key)
      if (typeof(key) == 'object') {
        newKey = task.completeName(key)
        response = {
          "text": `Did you mean *${newKey}* ?`
        }
        quickReply(sender_psid, response, key);
      } else {
        response = {
        "text": `\`\`\`\nPlease wait, we are retrieving information for ${key}...\n\`\`\``
        }
        // callSendAPI(sender_psid, response)
        Data.get_next_game(key, (err, reply) => {
          console.log("step1")
            if (err) {
              response = {
                "text" : `Cannot find your team: ${key}`
              }
              callSendAPI(sender_psid, response);
              console.log(response)
            } else if (key) {
              console.log("step2")
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
                  console.log("step3")
                  let time = task.timeFormat(reply[2], body.timezone);
                  let team = task.teamFormat(reply[0], reply[1], key);
                // Create the payload for a basic text message
                  response = {
                    "text": `${team[0]} will play against ${team[1]} on *${time}*, for ${reply[3]}.`
                  }
                  console.log(response)
                  console.log("replied");
                  callSendAPI(sender_psid, response);
                }
            })
          }
        })
      }
    } else {
      response = {
      "text": `Please enter the team you want or choose some quick option below!!!`
      }
      quickTeams(sender_psid, response);
    }

    // Handle the Players message
  } else if ((message[0] == 'Players') || (task.checkPlayerName(received_message.text) != "")) {
    console.log('holdValue:', message[0])
    if (received_message.text != 'Players') {
      const player = received_message.text
      response = {
        "text": `\`\`\`\nPlease wait, we are retrieving information for ${player}...\n\`\`\``
      }
      console.log(response)
      callSendAPI(sender_psid, response)
      Player.get_player_infor(player, (err, reply) => {
        console.log("step1")
          if (err) {
            response = {
              "text" : `Cannot find your player: ${player}`
            }
            callSendAPI(sender_psid, response);
            console.log(response)
          } else if (player) {
            console.log("step2")
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
                var graph = ['- Name: ,- Position: ', '- Height: ', '- Weight: ', '- Age: ', '- Date of Birth: ', '- Place of Birth: '];
                var index = 1
                var playerInfor = ""
                playerInfor += player
                reply.forEach((val) => {
                  if (index != 0) {
                    playerInfor += "\n" + graph[index] + val
                  } else {
                    playerInfor += graph[index] + val
                  }
                  index += 1;
                })
              // Create the payload for a basic text message
                response = {
                  "text": playerInfor
                }
                console.log(response)
                console.log("replied");
                callSendAPI(sender_psid, response);
              }
          })
        }
      })      
    } else {
        response = {
          "text": `Please enter the player you want or choose some quick option below!!!`
        }
        quickPlayers(sender_psid, response);
      }
  }
}

// Send the message back for users
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

// The QuickReply function
const quickReply = (sender_psid, response, value) => {
  jsonFile = task.quickReplies(value)
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
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

// The getStarted reply function
const getStarted = (sender_psid, response) => {
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": [{
        "content_type" : "text",
        "title": "Teams",
        "payload": "value"
      },{
        "content_type" : "text",
        "title": "Players",
        "payload": "value"
      }]
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


// The quickOption choose for users
const quickOption = (sender_psid, team) => {
  jsonFile = task.quickOptions(team)
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": "You choose " + team + ". Please select the option you want!!!",
      "quick_replies": jsonFile
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

// The quickTeams choose for users
const quickTeams = (sender_psid, response) => {
  jsonFile = task.popularTeam();
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
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

// The quickTeams choose for users
const quickPlayers = (sender_psid, response) => {
  jsonFile = task.popularPlayers();
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
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

// Share the news template generic for users
// const shareNews = (sender_psid, newsLink) => {
//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message":{
//       "text": "Testing",
//       "attachment":{
//         "type":"template",
//         "payload":{
//           "template_type":"generic",
//           "elements":[{
//               "title":"Here is the news",
//               "subtitle":"View more details of this game.",
//               "image_url":"https://media.xiph.org/BBB/BBB-360-png/big_buck_bunny_01542.png",
//               "buttons":[{
//                 type: 'element_share'
//                 }]  
//             }]
//         }
//       }
//     }
//   }
//   // Send the HTTP request to the Messenger Platform
//   request({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     // "uri": "http://localhost:3100/v2.6",
//     "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
//     "method": "POST",
//     "json": request_body
//   }, (err, res, body) => {
//     if (err) {
//       console.error("Unable to send message:" + err);
//     }
//   });
// }

function handlePostback (sender_psid, received_postback) {

}

module.exports = {
  handleMessage,
  callSendAPI,
  quickReply,
  handlePostback,
  // shareNews,
  quickTeams,
  getStarted,
  quickPlayers,
  quickOption
};