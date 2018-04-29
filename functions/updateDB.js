const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');
const exceptionChar = [".", "#", "$", "[", "]"];

let bucket = require('../data/firebase.js');
let db = bucket.db;
let onGoing = [];
let running = false

// Looking for Team Name
function dbTeamName(key) {
    if (running == false) {

        // To prevent 2 async functions running at once.
        running = true;
        db.ref('Teams/').child(dataFormat.cleanKeyDB(key).toUpperCase()).once('value', function(snapshot) {

            // Reset the defult value for Running
            running = false;

            // If the team name is not in the database
            if (!snapshot.exists()) {
                running = true
            	console.log('Looking for: ' + key.toUpperCase());

                // Async function helps searching for Team Name
                data.get_team_name(key, (err, reply) => {
                    if (!err) {
                    	console.log("FOUNDED TEAM: " + key);
                        var teamName = reply[0];
                        var imageURL = reply[1];

                        // Save to database the mistakenly typed Team Name
                        if (!(dataFormat.cleanKeyDB(reply[0]).toUpperCase().includes(key.toUpperCase()))) {
                            db.ref('Teams/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                                'name': teamName,
                                'imageURL': imageURL 
                            });
                        }

                        // Save new search to the database
                        db.ref('Teams/' + dataFormat.cleanKeyDB(teamName).toUpperCase() + '/').set({
                            'name': teamName,
                            'imageURL': imageURL 
                        });

                        // Automatically get the next game of the team
                        dbNextGame(teamName, -1);
                    }
                    else {
                    	console.log("Error occured on Server for TEAM: " + key);
                    }

                    // Finish Geting Team Name
                    running = false;
                })
            }
            else {

                // If team name is not in the database, release running immediately.
                running = false;
            }
        });
    }
    else {

        // Recursive Function if there is a queue of Async functions.
        setTimeout(() => {
            dbTeamName(key);
        }, 3000);
    }
}

// Get the next game of the team
function dbNextGame(key, iniTime) {

    // Check if there is any async process running in the background
    if (running == false) {

        // Notify the machine that there is a function running
        running = true;

        // Time pass in exceed limit for SetTimeout
        if ((iniTime - (new Date()).getTime()) > 2147483646) {
            console.log("Time exceeds Limit for MATCH: " + key);
            running = false
        }

        // Check if the initial time is given or not (in this case, not)
        else if (iniTime != -1) {
            setTimeout(() => {
                dbNextGame(key, -1)
            }, iniTime - (new Date()).getTime() + 8300000);
            running = false;
        }

        // Get new data and save it to database by crawling ESPN
        else {
            console.log(key);

            // Get rid of all special characters
            key = dataFormat.cleanKeyDB(key);
            data.get_next_game(key, (err, reply) => {
                if (err) {
                    console.log("Error occured on Server for MATCH: " + key);
                    console.error("################################");
                    console.error(err);
                    console.error("################################");
                    running = false;
                }
                else {
                    console.log("Found Match: " + key);

                    // Set the keyword as team1. (To prevent confusion later since there are team1 and team2)
                    if (dataFormat.cleanKeyDB(key).toUpperCase() != dataFormat.cleanKeyDB(reply[0]).toUpperCase()) {
                        var temp = reply[0];
                        reply[0] = reply[1];
                        reply[1] = temp;
                    }

                    // Save match to the database
                    db.ref('Matches/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                        'team1': reply[0],
                        'team2': reply[1],
                        'time': reply[2],
                        'league': reply[3],
                        'url': reply[4]
                    })

                    // Looking for the name of the opponent team
                    dbTeamName(dataFormat.cleanKeyDB(reply[1]));

                    // Automatically get afterward match after the next one is finished
                    setTimeout(() => {
                        dbNextGame(key, -1)
                    }, (new Date(reply[2])) - (new Date()) + 8300000 )
                    running = false;
                }
            })
        }
    }
    else {

        // Recursive Function if there is a queue of Async functions.
        setTimeout(() => {
            dbNextGame(key, iniTime);
        }, 3000);
    }
}

function clearOldMatches() {
    db.ref('Matches/').once('value', (allMatches) => {
        allMatches.forEach((eachMatch) => {
            if (new Date().getTime() > new Date(eachMatch.val().time).getTime() + 8300000) {
                db.ref('Matches/' + dataFormat.cleanKeyDB(eachMatch.key) + '/').set({});
            }
        })
        console.log('Cleared old matches.')
    })
    setTimeout(() => {
        clearOldMatches();
    }, 43200000);
}

function updateAllCurrentMatches() {
    db.ref('Matches/').once('value', (allMatches) => {
        allMatches.forEach((eachMatch) => {
            if ((new Date(eachMatch.val().time)).getTime() - (new Date()).getTime() < 2147483647) {
                dbNextGame(eachMatch.val().team1, (new Date(eachMatch.val().time)).getTime());
                onGoing.push(eachMatch.val().team1);
            }
        })
        console.log("Save all matches from Firebase to onGoing List");
    })
}

// Search for all the matches that are currently in Database/Teams
function updateMatchesFromTeams() {
    db.ref('Teams/').once('value', (allTeams) => {
        allTeams.forEach((eachTeam) => {
            db.ref('Matches/').child(dataFormat.cleanKeyDB(eachTeam.key).toUpperCase()).once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    dbNextGame(eachTeam.key, -1);
                }
            })
        })
    })
}

// Set all Reminders when restart sever.
function setAllReminders() {
    db.ref("Reminders/").once("value", (allSenderPSID) => {
        allSenderPSID.forEach((eachSenderPSID) => {
            var sender_psid = eachSenderPSID.key;
            eachSenderPSID.forEach((matchInfo) => {
                var timeDif = new Date(matchInfo.val().time) - new Date();

                if (timeDif > 0) {
                    setTimeout(() => {
                        var response = {
                            'text': `In ${new Date(timeDif).getMinutes()} minutes:\n${matchInfo.val().team1} vs ${matchInfo.val().team2}`
                        };
                        sendResponse.directMessage(sender_psid, response);

                        db.ref("Reminders/").child(sender_psid).child(matchInfo.key).set({});
                    }, timeDif - 910000);
                } 

                else {
                    db.ref("Reminders/").child(sender_psid).child(matchInfo.key).set({});
                }
            })
        })

        console.log("All reminders have been set");
    })
}

// Save the number of searches have been performed on a player.
function popularPlayer(playerName) {
    db.ref("PopularPlayers").child(playerName).once("value", (result) => {

        // Create new player in the Database if not exist.
        if (!(result.exists())) {
            db.ref("PopularPlayers/").child(playerName).set({
                "searchCount": 1
            })
        }

        // Increase the number of search on the existing player.
        else {
            db.ref("PopularPlayers").child(playerName).set({
                "searchCount": result.val().searchCount + 1
            })
        }
    })
}

// Save the number of searches have been performed on a team.
function popularTeam(teamName) {
    db.ref("PopularTeams").child(teamName).once("value", (result) => {

        // Create new team in the Database if not exist.
        if (!(result.exists())) {
            db.ref("PopularTeams/").child(teamName).set({
                "searchCount": 1
            })
        }

        // Increase the number of search on the existing team.
        else {
            db.ref("PopularTeams").child(teamName).set({
                "searchCount": result.val().searchCount + 1
            })
        }
    })
}

// Give back all the matches that are currently observed and updated
function getOnGoing() {
    return onGoing;
}
 
// Set the status for running thread 
function setRunning(running) {
    this.running = running;
}

// Print out if any thread is running.
function getRunning() {
    console.log(running);
}

module.exports = {
	dbTeamName,
    dbNextGame,
    clearOldMatches,
    updateAllCurrentMatches,
    updateMatchesFromTeams,
    popularPlayer,
    popularTeam,
    getOnGoing,
    setRunning,
    getRunning,
    setAllReminders
}