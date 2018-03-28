const
  bodyParser = require('body-parser'),
  request = require('request'),
  Data = require('../data/get_data'),
  task = require('./function'),
  message = []

const handleMessage = (sender_psid, received_message) => {
  let news;
  let response;
  let holdValue;
  console.log("message: " + received_message.text);

  // Handle Get Started text message
  if (received_message.text == 'Get Started') {
    response = {
      "text": `Please select the options you want!!!`
    }
    message = []
    console.log('GetStarted')
    getStarted(sender_psid, response);

    // Handle Teams message
  } else if ((received_message.text == 'Teams') || (task.checkSpellName(received_message.text) != "") || (typeof(checkSpellName(received_message.text)) == 'object')) {
    if (received_message.text != 'Teams') {
      const key = task.checkSpellName(received_message.text)
      message.push(key)
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
        console.log(response)
        Data.get_next_game(key, (err, reply) => {
          console.log("step1")
            if (err) {
              response = {
                "text" : "Something went wrong. Please try again"
              }
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
      if (message.length <= 1) {
      message.push(received_message.text)
      } else if (message.length > 1) {
        message = []
      }
      response = {
      "text": `Please enter the team you want or choose some quick option below!!!`
      }
      quickTeams(sender_psid, response);
    }

    // Handle the Players message
  } else if ((received_message.text == 'Players') || (task.checkPlayerName(received_message.text) != "")) {
    if (received_message.text != 'Players') {
      const player = received_message.text
      message.push(player)
    } else {
        if (message.length <= 1) {
          message.push(received_message.text)
        } else if (message.length > 1) {
          message = []
        }
        response = {
          "text": `Please enter the player you want or choose some quick option below!!!`
        }
        quickPlayers(sender_psid, response);
      }
  }
}

//   if((received_message.text != 'Next Match') && (received_message.text != 'Team News') && (received_message.text != 'Team Squad') && (received_message.text != 'Team Schedules')) {
//     key = task.checkSpellName(received_message.text);
//     console.log(key)
//     if (key != "" && typeof(key) != 'object') {
//       if (message.length >= 1) {
//         message = []
//       } else {
//         message.push(key)
//       }
//     }
//     // Check if the key is an array
//     if (typeof(key) == 'object') {
//       newKey = task.completeName(key)
//       response = {
//       "text": `Did you mean *${newKey}* ?`
//       }
//       quickReply(sender_psid, response, key);
//       } else {
//       response = {
//           "text": `\`\`\`\nPlease wait, we are retrieving information for ${key}...\n\`\`\``
//       };
//       console.log(response)
//       callSendAPI(sender_psid, response);
//               Data.get_next_game(key, (err, reply) => {
//             if (err) {
//               response = {
//                 "text" : "Something went wrong. Please try again"
//               }
//             } else if (key) {
//               request( {
//                 "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
//                 "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
//                 "method": "GET",
//                 "json": true,
//               }, (err, res, body) => {
//               // Test
//                 if (err) {
//                   console.error("Unable to send message:" + err);
//                 } else {
//                   let time = task.timeFormat(reply[2], body.timezone);
//                   let team = task.teamFormat(reply[0], reply[1], key);
//                   let news = reply[4];
//                 // Create the payload for a basic text message
//                   // response = {
//                   //   "text": `${team[0]} will play against ${team[1]} on *${time}*, for ${reply[3]}.`
//                   // }
//                   // callSendAPI(sender_psid, response);
//                   console.log(body.timezone)
//                   console.log("replied");
//                   console.log("time: " + time)
//                   console.log("team: " + team)
//                   console.log("news: " + news)
//                   console.log("key: " + key)

                  
//                 }
//             })
//           }
//         })
//     }
//   } else {
//     pick = task.optionChoose(received_message.text);
//     key = message[0]
//     message.shift();
//   }
//   } else {
//     pick = task.optionChoose(received_message.text);
//     key = message[0]
//     message.shift()
//   }
//   console.log("array: " + message);
//   console.log("key: " + key);
//   console.log("Pick: " + pick);

//   } else {
//     if (typeof(pick) == 'undefined') {
//       quickOption(sender_psid, key);
//     }

    // if (pick == "Next Match") {

    //     response = {
    //       "text": `\`\`\`\nPlease wait, we are retrieving information for ${key}...\n\`\`\``
    //     };
    //     console.log("waiting...");
    //     callSendAPI(sender_psid, response);
    //     Data.get_next_game(key, (err, reply) => {
    //       console.log("step1")
    //         if (err) {
    //           response = {
    //             "text" : "Something went wrong. Please try again"
    //           }
    //         } else if (key) {
    //           console.log("step2")
    //           request( {
    //             "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
    //             "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
    //             "method": "GET",
    //             "json": true,
    //           }, (err, res, body) => {
    //           // Test
    //             if (err) {
    //               console.error("Unable to send message:" + err);
    //             } else {
    //               console.log("step3")
    //               let time = task.timeFormat(reply[2], body.timezone);
    //               let team = task.teamFormat(reply[0], reply[1], key);
    //             // Create the payload for a basic text message
    //               response = {
    //                 "text": `${team[0]} will play against ${team[1]} on *${time}*, for ${reply[3]}.`
    //               }
    //               console.log("replied");
    //               news = reply[4];
    //               callSendAPI(sender_psid, response);
    //             }
    //         })
    //       }
    //     })
    //   } else if(pick == 'Team News') {
    //     Data.get_next_game(key, (err, reply) => {
    //         if (err) {
//               response = {
//                 "text" : "Something went wrong. Please try again"
//               }
//             } else if (key) {
//               request( {
//                 "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
//                 "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
//                 "method": "GET",
//                 "json": true,
//               }, (err, res, body) => {
//                 if (err) {
//                   console.error("Unable to send message:" + err);
//                 } else {
//                   news = reply[4];
//                   console.log(news)
//                   shareNews(sender_psid, news)
//                   if (typeof(response) != 'undefined') {
//                     callSendAPI(sender_psid, response);
//                   }
//                 }
//             })
//           }
//         })
//       }
//     }
// }

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