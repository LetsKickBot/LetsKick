const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  Player = require('../data/get_player'),
  task = require('./function')
  
let message = []
let choice = []

const handleMessage = (sender_psid, received_message) => {

  let wordGraph = ['get started', 'begin', 'start', 'hello', 'options', 'Get Started', 'Begin', 'Start', 'Hello', 'Options', 'Back', 'Go Back', 'back', 'go back', 'take me back', 'Take me back'];
  console.log("message: " + received_message.text);

  // Append value to array
  if (received_message.text == 'Teams') {
    message.push('Teams')
  } else if (received_message.text == 'Players') {
    message.push('Players')
  }

  console.log(message)

  // Handle Get Started text message
  if ((wordGraph.includes(received_message.text))) {
    message = []
    request({
                "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "first_name"},
                "method": "GET",
                "json": true,
              }, (err, res, body) => {
                if (err) {
                  console.error("Unable to send message:" + err);
                } else {
                  let userName = body.first_name;
                // Create the payload for a basic text message
                  response = {
                    "text": `Hi ${userName}, Welcome to our Lets Kick bot. What are you looking for today? Please select the options you want below!!!`
                  }
                }
                console.log(response)
                task.getStarted(sender_psid, response);
    })

  // Handle Teams message
  } else if ((message[0] == 'Teams')) {
    console.log('holdValue:', message[0])
    if (received_message.text != 'Teams') {
      const key = task.checkSpellName(received_message.text)
      if (typeof(key) == 'object') {
        newKey = task.completeName(key)
        response = {
          "text": `Did you mean *${newKey}* ?`
        }
        task.quickReply(sender_psid, response, key);
      } else {
        response = {
          "text" : `\`\`\`\nPlease wait, we are retrieving information for *${key}*...\n\`\`\``
        }
        console.log(response)
        task.callSendAPI(sender_psid, response)
        Data.get_next_game(key, (err, reply) => {
          console.log("In Team section")
            if (err) {
              response = {
                "text" : `Cannot find your team: *${key}*`
              }
              task.callSendAPI(sender_psid, response);
              console.log(response)
            } else if (key) {
              task.quickOption(sender_psid)
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
                    "text": `*${team[0]}* will play against *${team[1]}* on *${time}*, for *${reply[3]}*.`
                  }
                  console.log(response)
                  console.log("replied");
                  if(received_message.text == "Next Match") {
                    task.callSendAPI(sender_psid, response);
                  } else if (received_message.text == "Team News") {
                    console.log('Testing news')
                  }
                }
            })
          }
        })
      }
    } else {
      response = {
      "text": `Please enter the team you want or choose some quick option below!!!`
      }
      task.quickTeams(sender_psid, response);
    }

    // Handle the Players message
  } else if ((message[0] == 'Players')) {
    console.log('holdValue:', message[0])
    if (received_message.text != 'Players') {
      const player = received_message.text
      response = {
        "text": `\`\`\`\nPlease wait, we are retrieving information for *${player}*...\n\`\`\``
      }
      console.log(response)
      task.callSendAPI(sender_psid, response)
      Player.get_player_infor(player, (err, reply) => {
        console.log("In Player section")
          if (err) {
            response = {
              "text" : `Cannot find your player: *${player}*`
            }
            task.callSendAPI(sender_psid, response);
            console.log(response)
          } else if (player) {
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
                var graph = ['- Position: ', '- Height: ', '- Weight: ', '- Age: ', '- Date of Birth: ', '- Place of Birth: '];
                var index = 0
                var playerInfor = ""
                playerInfor += '- Name: ' +  player.toUpperCase() + '\n'
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
                task.callSendAPI(sender_psid, response);
              }
          })
        }
      })      
    } else {
        response = {
          "text": `Please enter the player you want or choose some quick option below!!!`
        }
        task.quickPlayers(sender_psid, response);
      }
  }
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
  handlePostback
  // shareNews,
};