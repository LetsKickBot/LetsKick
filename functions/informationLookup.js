const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');
const updateDB = require('./updateDB.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

let onGoing = [];

// Looks for the name and logo of the team.
function teamNameLookup(sender_psid, key) {
    let flag = true;
    key = key.toUpperCase();

    // Check if the team name is already in the database or not
    db.ref('Teams/').on("child_added", (teamName) => {
        if (flag == true && teamName.key.includes(key)) {
            flag = false;
            handleCases.teamOptions(sender_psid, teamName.val().name, teamName.val().imageURL);
        }
        db.ref('Teams/').off("child_added");
    });

    // If the team name is not in the database, look it up.
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

// Gets match's information
function matchLookup(sender_psid, key, status) {
    let flag = true;
    key = key.toUpperCase();

    db.ref('Matches/').orderByChild('time').on("child_added", (match) => {
        if (flag == true && match.key.includes(key) && status.includes('Next Match')) {
            flag = false;
                var team1 = match.val().team1;
                var team2 = match.val().team2;
                var team = dataFormat.teamFormat(team1, team2, key);
                var league = match.val().league;

                // Gets team name if it does not exist in the database yet.
                updateDB.dbTeamName(team1);
                updateDB.dbTeamName(team2);

            request({
                "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                "method": "GET",
                "json": true,
            }, (err, res, body) => {
                var time = dataFormat.timeFormat(match.val().time, body.timezone);
                if (status.includes('Next Match')) {
                    response = {
                        "text": `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${league}`
                    };
                    console.log("replied");
                    sendResponse.directMessage(sender_psid, response);
                }

                setTimeout(() => {
                    handleCases.setReminder(sender_psid, match.key);
                }, 1000);
            })

            // Updates match information after the game
            if (!onGoing.includes(team1)) {
                setTimeout(() => {
                    var removeIndex = onGoing.indexOf(team1);
                    onGoing.splice(removeIndex, 1);
                    data.get_next_game(team1, (err, reply) => {
                        if (!err) {
                            console.log("FOUNDED MATCH: " + team1);
                            db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({
                                'team1': reply[0],
                                'team2': reply[1],
                                'time': reply[2],
                                'league': reply[3],
                                'url': reply[4]
                            });
                            db.ref('Matches/' + match.key + '/').set({});

                            // Gets team name if it does not exist in the database yet.
                            updateDB.dbTeamName(reply[0]);
                            updateDB.dbTeamName(reply[1]);
                        }
                        else {
                            console.log("Error occured on Server for MATCH: " + team1);
                        }
                    })
                }, (new Date(match.val().time)).getTime() - (new Date()).getTime() + 8100000);
                onGoing.push(team1);
            }

            // Updates match information after the game
            if (!onGoing.includes(team2)) {
                setTimeout(() => {
                    var removeIndex = onGoing.indexOf(team2);
                    onGoing.splice(removeIndex, 1);
                    data.get_next_game(team2, (err, reply) => {
                        if (!err) {
                            console.log("FOUNDED MATCH: " + team2);
                            db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({
                                'team1': reply[0],
                                'team2': reply[1],
                                'time': reply[2],
                                'league': reply[3],
                                'url': reply[4]
                            });
                            db.ref('Matches/' + match.key + '/').set({});

                            // Gets team name if it does not exist in the database yet.
                            updateDB.dbTeamName(reply[0]);
                            updateDB.dbTeamName(reply[1]);
                        }
                        else {
                            console.log("Error occured on Server for MATCH: " + team2);
                        }
                    })
                }, (new Date(match.val().time)).getTime() - (new Date()).getTime() + 8100000);
                onGoing.push(team2);
            }

            db.ref('Matches/').off("child_added");
        }
    });

    setTimeout(() => {
        if (flag == true) {
            let response;
            key = dataFormat.checkDuplicate(key);
            response = {
                "text": `Please wait, we are retrieving the team information...`
            };
            console.log("waiting...");
            sendResponse.directMessage(sender_psid, response);

            
            // In case user want the Next Match Schedule
            if (status.includes('Next Match')) {

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
                                    flag = false;
                                    let time = dataFormat.timeFormat(reply[2], body.timezone);
                                    let team = dataFormat.teamFormat(reply[0], reply[1], key);
                                    let league = reply[3];
                                    let url = reply[4];

                                    // Gets team name if it does not exist in the database yet.
                                    updateDB.dbTeamName(reply[0]);
                                    updateDB.dbTeamName(reply[1]);

                                    db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({
                                        'team1': reply[0],
                                        'team2': reply[1],
                                        'time': reply[2],
                                        'league': league,
                                        'url': url
                                    });

                                    // Updates match information after the game
                                    setTimeout(() => {
                                        var removeIndex = onGoing.indexOf(reply[0]);
                                        onGoing.splice(removeIndex, 1);
                                        data.get_next_game(reply[0], (err, reply1) => {
                                            if (!err) {
                                                console.log("FOUNDED MATCH: " + reply[0]);
                                                db.ref('Matches/' + reply1[0].toUpperCase() + '_' + reply1[1].toUpperCase() + '/').set({
                                                    'team1': reply1[0],
                                                    'team2': reply1[1],
                                                    'time': reply1[2],
                                                    'league': reply1[3],
                                                    'url': reply1[4]
                                                });
                                                db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({});

                                                // Gets team name if it does not exist in the database yet.
                                                updateDB.dbTeamName(reply1[0]);
                                                updateDB.dbTeamName(reply1[1]);
                                            }
                                            else {
                                                console.log("Error occured on Server for MATCH: " + reply[0]);
                                            }
                                        })
                                    }, (new Date(reply[2])).getTime() - (new Date()).getTime() + 8100000);
                                    onGoing.push(reply[0]);

                                    // Updates match information after the game
                                    setTimeout(() => {
                                        var removeIndex = onGoing.indexOf(reply[1]);
                                        onGoing.splice(removeIndex, 1);
                                        data.get_next_game(reply[1], (err, reply1) => {
                                            if (!err) {
                                                console.log("FOUNDED MATCH: " + reply[1]);
                                                db.ref('Matches/' + reply1[0].toUpperCase() + '_' + reply1[1].toUpperCase() + '/').set({
                                                    'team1': reply1[0],
                                                    'team2': reply1[1],
                                                    'time': reply1[2],
                                                    'league': reply1[3],
                                                    'url': reply1[4]
                                                });
                                                db.ref('Matches/' + reply[0].toUpperCase() + '_' + reply[1].toUpperCase() + '/').set({});

                                                // Gets team name if it does not exist in the database yet.
                                                updateDB.dbTeamName(reply1[0]);
                                                updateDB.dbTeamName(reply1[1]);
                                            }
                                            else {
                                                console.log("Error occured on Server for MATCH: " + reply[1]);
                                            }
                                        })

                                    }, (new Date(reply[2])).getTime() - (new Date()).getTime() + 8100000);
                                    onGoing.push(reply[1]);

                                    response = {
                                        "text": `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${league}`
                                    };
                                    console.log("replied");
                                    sendResponse.directMessage(sender_psid, response);
                                })
                            }
                        })
                        setTimeout(() => {
                            handleCases.setReminder(sender_psid, reply[0].toUpperCase() + '_' + reply[1].toUpperCase());
                        }, 1000);
                    }
                })
            } 

            // In case user want to see the lastest Team News
            else if (status.includes('Team News')) {
                // Async function to look for the Next Match.
                data.get_team_news(key, (err, reply) => {
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
                                    let url = reply[0];
                                    let imageUrl = reply[1];
                                    let newsTitle = reply[2];
                                    let newsSubtitle = reply[3];

                                    sendResponse.teamNewsURL(sender_psid, key, url, imageUrl, newsTitle, newsSubtitle);
                                    console.log("replied");
                                })
                            }
                        })
                    }

                })
            }

            else if (status.includes('Team Squad')) {
                // Async function to look for the Next Match.
                data.get_team_squad(key, (err, reply) => {
                    if (err) {
                        response = {
                            "text" : `Cannot find the Team Squad: ${key}`
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
                                    let url = reply[0];
                                    let formation = reply[1];
                                    let players = reply[2];
                                    let teamPlayer = ""
                                    for (var i = 0; i < players.length; i++) {
                                        teamPlayer = '\n' + teamPlayer + players[i];
                                    }
                                    response = {
                                        "text" : `Team Formation: ${formation}\nPlayers:${teamPlayer}`
                                    }
                                    sendResponse.directMessage(sender_psid, response);
                                    console.log("replied");
                                })
                            }
                        })
                    }

                })
            } 
        }
    }, 1200)
}

// Look for the specific player
function playerLookup(sender_psid, key) {

    let flag = true;
    key = key.toUpperCase();

    // Checks if the player is already in database
    db.ref('Players/').on("child_added", (playerName) => {
        if (flag == true && playerName.key.includes(key)) {
            flag = false;
            sendResponse.playerReply(sender_psid, playerName.val().playerTitle,
                playerName.val().playerSubtitle, playerName.val().playerImageURL,
                playerName.val().playerURL);
            db.ref('Players/').off("child_added");
        }
    });

    // If the player is not in the database, search for him
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
            })
        }
    }, 1200);
}

module.exports = {
    teamNameLookup,
    matchLookup,
    playerLookup
}