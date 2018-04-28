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
                data.get_team_name(key, (err, reply) => {
                    if (!err) {
                    	console.log("FOUNDED TEAM: " + key);
                        var teamName = reply[0];
                        var imageURL = reply[1];

                        if (!(dataFormat.cleanKeyDB(reply[0]).toUpperCase().includes(key.toUpperCase()))) {
                            db.ref('Teams/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                                'name': teamName,
                                'imageURL': imageURL 
                            });
                        }
                        db.ref('Teams/' + dataFormat.cleanKeyDB(teamName).toUpperCase() + '/').set({
                            'name': teamName,
                            'imageURL': imageURL 
                        });

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

function dbNextGame(key, iniTime) {
    if (running == false) {
        running = true;
        if ((iniTime - (new Date()).getTime()) > 2147483646) {
            console.log("Time exceeds Limit for MATCH: " + key);
            running = false
        }
        else if (iniTime != -1) {
            setTimeout(() => {
                dbNextGame(key, -1)
            }, iniTime - (new Date()).getTime() + 8300000);
            running = false;
        }
        else {
            console.log(key);
            key = dataFormat.cleanKeyDB(key);
            data.get_next_game(key, (err, reply) => {
                if (err) {
                    running = false;
                }
                else {
                    console.log("Found Match: " + key);
                    if (dataFormat.cleanKeyDB(key).toUpperCase() != dataFormat.cleanKeyDB(reply[0]).toUpperCase()) {
                        var temp = reply[0];
                        reply[0] = reply[1];
                        reply[1] = temp;
                    }

                    db.ref('Matches/' + dataFormat.cleanKeyDB(key).toUpperCase() + '/').set({
                        'team1': reply[0],
                        'team2': reply[1],
                        'time': reply[2],
                        'league': reply[3],
                        'url': reply[4]
                    })

                    dbTeamName(dataFormat.cleanKeyDB(reply[1]));

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

// Testing
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

function setAllReminders() {
    db.ref('Reminder/').once("value", (newVal) => {
        newVal.forEach((newVal1) => {
            newVal1.forEach((newVal2) => {
                handleCases.setReminder(newVal1.key, newVal2.val().team);
            })
        })
    });
    console.log("All remiders have been set.");
}

function getOnGoing() {
    return onGoing;
}

function setRunning(running) {
    this.running = running;
}

function getRunning() {
    console.log(running);
}

module.exports = {
	dbTeamName,
    dbNextGame,
    clearOldMatches,
    updateAllCurrentMatches,
    updateMatchesFromTeams,
    getOnGoing,
    setRunning,
    getRunning,
    setAllReminders
}