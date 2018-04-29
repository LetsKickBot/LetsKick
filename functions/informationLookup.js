const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');
const updateDB = require('./updateDB.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

let onGoing = updateDB.getOnGoing();

// Looks for the name and logo of the team.
function teamNameLookup(sender_psid, key) {
    let flag = true;
    key = dataFormat.cleanKeyDB(key).toUpperCase();

    // Check if the team name is already in the database or not
    db.ref('Teams/').once("value", (allTeamName) => {
        allTeamName.forEach((teamName) => {
            if (teamName.key.includes(key)) {
                flag = false;
                handleCases.teamOptions(sender_psid, teamName.val().name, teamName.val().imageURL);
            }
        })
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
                        db.ref('Teams/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                            'name': teamName,
                            'imageURL': imageURL 
                        });
                    }
                    db.ref('Teams/' + dataFormat.cleanKeyDB(teamName).toUpperCase() + '/').set({
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
    key = dataFormat.cleanKeyDB(key).toUpperCase();

    // Check if Match has already been in the DataBase
    db.ref('Matches/').orderByChild('time').once("value", (allMatches) => {

        // Try - caught statement is used as a replacement for break
        try {
            allMatches.forEach((match) => {
                if (match.key == key) {
                    flag = false;
                    var team1 = match.val().team1;
                    var team2 = match.val().team2;
                    var team = dataFormat.teamFormat(team1, team2, key);
                    var league = match.val().league;

                    // Creates Team Name.
                    updateDB.dbTeamName(match.val().team1);
                    updateDB.dbTeamName(match.val().team2);
                    updateDB.dbNextGame(match.val().team2);

                    if (!onGoing.includes(team1)) {
                        updateDB.dbNextGame(team1, (new Date(match.val().time)).getTime());
                        onGoing.push(team1);
                    }

                    // Get time zone and send message to user
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

                        // Ask for reminder
                        setTimeout(() => {
                            handleCases.askReminder(sender_psid, match.key);
                        }, 1000);
                    })
                    throw BreakException
                }
            })
        } 

        catch (e) {}
    });


    // If not, run script.
    setTimeout(() => {
        if (flag == true) {
            let response;
            key = dataFormat.checkDuplicate(key);
            response = {
                "text": `Please wait, we are retrieving the team information...`
            };
            sendResponse.directMessage(sender_psid, response);

            // Notify the compiler that there is a async process running
            updateDB.setRunning(true);

            // Async function to look for the Next Match.
            data.get_next_game(key, (err, reply) => {
                if (err) {
                    console.log("Error occured on Server for MATCH: " + key);
                    response = {
                        "text" : `Cannot find the Match for: ${key}`
                    }
                    sendResponse.directMessage(sender_psid, response);
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
                        let imageUrl = reply[5];
                        let newsTitle = reply[6];
                        let newsSubtitle = reply[7];

                        // Make sure that the keyword always in team1 (instead of team2)
                        if (key.toUpperCase() != reply[0].toUpperCase()) {
                            var temp = reply[0];
                            reply[0] = reply[1];
                            reply[1] = temp;
                        }

                        // Save new match to the database
                        db.ref('Matches/' + dataFormat.cleanKeyDB(reply[0]).toUpperCase() + '/').set({
                            'team1': reply[0],
                            'team2': reply[1],
                            'time': reply[2],
                            'league': league,
                            'url': url
                        });

                        // Creates Team Names
                        updateDB.dbTeamName(reply[0]);
                        updateDB.dbTeamName(reply[1]);
                        updateDB.dbNextGame(reply[1]);

                        // Updates match information after the game
                        if (!onGoing.includes(reply[0])) {
                            updateDB.dbNextGame(reply[0], (new Date(reply[2])).getTime());
                            onGoing.push(reply[0]);
                        }

                        // In case user want the Next Match Schedule
                        if (status.includes('Next Match')) {
                            response = {
                                "text": `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${league}`
                            };
                            sendResponse.directMessage(sender_psid, response);
                        }
                        updateDB.setRunning(false);
                    })

                    // Ask for reminder
                    setTimeout(() => {
                        handleCases.askReminder(sender_psid, reply[0].toUpperCase());
                    }, 1000);
                }
            })
        }
    }, 1200);
}


// Look for the specific player
function playerLookup(sender_psid, key) {

    let flag = true;
    key = key.toUpperCase();

    // Checks if the player is already in database
    db.ref('Players/').once("value", (allPlayers) => {
        allPlayers.forEach((eachPlayer) => {
            if (eachPlayer.key.includes(key)) {
                flag = false;

                // Increase the number of search for the player.
                updateDB.popularPlayer(eachPlayer.key);
                
                sendResponse.playerReply(sender_psid, eachPlayer.val().playerTitle,
                    eachPlayer.val().playerSubtitle, eachPlayer.val().playerImageURL,
                    eachPlayer.val().playerURL);
            }
        })
    })

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
                    console.log("Error occured on Server for PLAYER: " + key)
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

                    // If user input is not contained in the Team Name but the search bar still gives back result
                    if (!(reply[2].toUpperCase().includes(key.toUpperCase()))) {
                        db.ref('Players/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                            'playerURL': playerURL,
                            'playerTitle': playerTitle,
                            'playerSubtitle': playerSubtitle,
                            'playerImageURL': playerImageURL
                        });
                    }

                    // Save search result to database
                    db.ref('Players/' + dataFormat.cleanKeyDB(playerName).toUpperCase() + '/').set({
                        'playerURL': playerURL,
                        'playerTitle': playerTitle,
                        'playerSubtitle': playerSubtitle,
                        'playerImageURL': playerImageURL
                    });

                    // Increase the number of search for the player.
                    updateDB.popularPlayer(teamName.toUpperCase());

                    console.log("replied");
                    sendResponse.playerReply(sender_psid, playerTitle, playerSubtitle, playerImageURL, playerURL);
                }
            })
        }
    }, 1200);
}

function displayOnGoing() {
    console.log(onGoing);
}

module.exports = {
    teamNameLookup,
    matchLookup,
    playerLookup,
    displayOnGoing
}
