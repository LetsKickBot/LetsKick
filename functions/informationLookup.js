const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;


// Look for the next match of the Team
function teamNameLookup(sender_psid, key) {
    let flag = true;
    key = key.toUpperCase();

    db.ref('Teams/').on("child_added", (teamName) => {
        if (flag == true && teamName.key.includes(key)) {
            flag = false;
            handleCases.teamOptions(sender_psid, teamName.val().name, teamName.val().imageURL);
        }
        db.ref('Teams/').off();
    });

    setTimeout(() => {
        if (flag == true) {
            response = {
                'text': 'Please wait, we are retrieving information...'
            };
            sendResponse.directMessage(sender_psid, response);

            data.get_team_name(key, (err, reply) => {
                if (err) {
                    response = {
                        "text" : `Cannot find the Team: ${key}`
                    }
                    sendResponse.directMessage(sender_psid, response);
                }
                else {
                    flag = false;
                    console.log(key);
                    var teamName = reply[0];
                    var imageURL = reply[1];
                    if (!(reply[0].toUpperCase().includes(key.toUpperCase()))) {
                        db.ref('Teams/' + key.toUpperCase() + '/').set({
                            'name': teamName,
                            'imageURL': imageURL 
                        });
                    }
                    db.ref('Teams/' + teamName.toUpperCase() + '/').set({
                        'name': teamName,
                        'imageURL': imageURL 
                    });
                    handleCases.teamOptions(sender_psid, teamName, imageURL);
                }
            })
        }
    }, 1200);
}

function matchLookup(sender_psid, key, status) {
    let flag = true;
    key = key.toUpperCase();

    db.ref('Matches/').on("child_added", (match) => {
        if (flag == true && match.val().includes(key)) {
            var flag = false;
            var team = dataFormat.teamFormat(match.val().team1, match.val().team2, key);
            var time = match.val().time;
            var league = match.val().league;
            if (status.includes('Next Match')) {
                response = {
                    "text": `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${league}`
                };
                console.log("replied");
                sendResponse.directMessage(sender_psid, response);
            }

            setTimeout(() => {
                handleCases.getContinue(sender_psid);
            }, 1500)

            db.ref('Matches/').off()
        }
    })

    setTimeout(() => {
        if (flag == true) {
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


                                db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({
                                    'team1': reply[0],
                                    'team2': reply[1],
                                    'time': time,
                                    'league': league,
                                    'url': url
                                });

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
    })
}

// Look for the specific player
function playerLookup(sender_psid, key) {

    let flag = true;
    key = key.toUpperCase();

    db.ref('Players/').on("child_added", (playerName) => {
        if (flag == true && playerName.key.includes(key)) {
            flag = false;
            sendResponse.playerReply(sender_psid, playerName.val().playerTitle,
                playerName.val().playerSubtitle, playerName.val().playerImageURL,
                playerName.val().playerURL);
            setTimeout(() => {
                handleCases.getContinue(sender_psid);
            }, 1500)
            db.ref('Players/').off()
        }
    });

    setTimeout(() => {
        if (flag == true) {
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
                else {
                    flag = false;
                    let playerImageURL = reply[0];
                    let playerURL = reply[1];
                    let playerName = reply[2];
                    let playerTitle = reply[2] + ' - ' + reply[3];
                    let playerSubtitle = reply[4];
                    for (var eachData = 5; eachData < 7; eachData++) {
                        reply[eachData] = reply[eachData].charAt(0).toUpperCase() + reply[eachData].slice(1);  
                        playerSubtitle += '\n' + reply[eachData];
                    }


                    if (!(reply[2].toUpperCase().includes(key.toUpperCase()))) {
                        db.ref('Players/' + key.toUpperCase() + '/').set({
                            'playerURL': playerURL,
                            'playerTitle': playerTitle,
                            'playerSubtitle': playerSubtitle,
                            'playerImageURL': playerImageURL
                        });
                    }

                    db.ref('Players/' + playerName.toUpperCase() + '/').set({
                        'playerURL': playerURL,
                        'playerTitle': playerTitle,
                        'playerSubtitle': playerSubtitle,
                        'playerImageURL': playerImageURL
                    });



                    console.log("replied");
                    sendResponse.playerReply(sender_psid, playerTitle, playerSubtitle, playerImageURL, playerURL);
                }
                // Check if user want to continue searching
                setTimeout(() => {
                    handleCases.getContinue(sender_psid);
                }, 1500)
            })
        }
    }, 1200);
}

module.exports = {
    teamNameLookup,
    matchLookup,
    playerLookup
}
