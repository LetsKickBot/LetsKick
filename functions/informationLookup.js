const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');

// Look for the next match of the Team
function matchLookup(sender_psid, key, status) {
    let response;
    key = dataFormat.checkDuplicate(key);
    response = {
        "text": `Please wait, we are retrieving the team information...`
    };
    console.log("waiting...");
    sendResponse.directMessage(sender_psid, response);

    // Async function to look for the Next Match.
    data.get_next_game(key, (err, reply) => {
        if (err) {
            response = {
                "text" : `Cannot find the Team: ${key}`
            }
            sendResponse.directMessage(sender_psid, response);
        }
        else if (key) {
            request({
                "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                "method": "GET",
                "json": true,
            }, (err, res, body) => {
                if (err) {
                    console.error("Unable to send message:" + err);
                }
                else {
                    request({
                        "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                        "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                        "method": "GET",
                        "json": true,
                    }, (err, res, body) => {
                        let time = dataFormat.timeFormat(reply[2], body.timezone);
                        let team = dataFormat.teamFormat(reply[0], reply[1], key);
                        let league = reply[3];
                        let url = reply[4];
                        let imageUrl = reply[5];
                        let newsTitle = reply[6];
                        let newsSubtitle = reply[7];

                        // In case user want the Next Match Schedule
                        if (status.includes('Next Match')) {
                            response = {
                                "text": `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${league}`
                            };
                            console.log("replied");
                            sendResponse.directMessage(sender_psid, response);
                        }

                        // In case user want to see the lastest Team News
                        else if (status.includes('Team News')) {
                            sendResponse.teamNewsURL(sender_psid, key, url, imageUrl, newsTitle, newsSubtitle);
                            console.log("replied");
                        }

                        // In case user want to see the Next Match Squad
                        else if (status.includes('Team Squad')) {
                            response = {
                                "text": 'We are currently working on this feature. Please come back another time.'
                            }
                            console.log(replied);
                            sendResponse.directMessage(sender_psid, response);
                        }
                    })
                }
            })
        }
        setTimeout(() => {
            handleCases.getContinue(sender_psid);
        }, 1500)
    })
}

// Look for the specific player
function playerLookup(sender_psid, key) {
    console.log(key);
    let response = {
        "text": `Please wait, we are retrieving player information...`
    };
    console.log("waiting...");
    sendResponse.directMessage(sender_psid, response);

    // Async function to look for the Player.
    data.get_player_info(key, (err, reply) => {
        if (err) {
            response = {
                'text' : `Cannot find player: ${key}`
            };
            sendResponse.directMessage(sender_psid, response);
        } 
        else if (key) {
            let playerImageURL = reply[0];
            let playerURL = reply[1];
            let playerInfo = reply[2];
            let playerTitle = reply[2] + ' - ' + reply[3];
            let playerSubtitle = reply[4];
            for (var eachData = 5; eachData < 7; eachData++) {
                reply[eachData] = reply[eachData].charAt(0).toUpperCase() + reply[eachData].slice(1);  
                playerSubtitle += '\n' + reply[eachData];
            }
            console.log("replied");
            sendResponse.imageReply(sender_psid, playerTitle, playerSubtitle, playerImageURL, playerURL);
        }

        // Check if user want to continue searching
        setTimeout(() => {
            handleCases.getContinue(sender_psid);
        }, 1500)
    })
}

module.exports = {
    matchLookup,
    playerLookup
}
