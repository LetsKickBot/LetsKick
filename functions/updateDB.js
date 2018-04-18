const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

function dbTeamName(key) {
    db.ref('Teams/').child(key.toUpperCase()).once('value', function(snapshot) {
        if (!snapshot.exists()) {
        	console.log('Looking for: ' + key.toUpperCase());
            data.get_team_name(key, (err, reply) => {
                if (!err) {
                	console.log("FOUNDED TEAM: " + key);
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


                }
                else {
                	console.log("Error occured on Server for TEAM: " + key);
                }
            })
        }
    });
}

function dbNextGame(key, iniTime) {
    if (iniTime != -1) {
        setTimeout(() => {
            dbNextGame(key, -1)
        }, iniTime - (new Date()).getTime() + 8300000);
    }
    else {
        data.get_team_name(key, (err, reply) => {
            if (err) {
                console.log("Error occured on Server for Match: " + key);
            }
            else {
                console.log("Found Match: " + key);
                if (key.toUpperCase() != reply[0].toUpperCase()) {
                    var temp = reply[0];
                    reply[0] = reply[1];
                    reply[1] = temp;
                }

                db.ref('Matches/' + key.toUpperCase() + '/').set({
                    'team1': reply[0],
                    'team2': reply[1],
                    'time': reply[2],
                    'league': reply[3],
                    'url': reply[4]
                })

                dbTeamName(reply[0]);
                dbTeamName(reply[1]);

                setTimeout(() => {
                    dbNextGame(key, -1)
                }, (new Date(reply[2]) - (new Date()) + 8300000) )
            }
        })
    }
}

function clearOldMatches() {
    db.ref('Matches/').once('value', (allMatches) => {
        allMatches.forEach((eachMatch) => {
            if (new Date() > new Date(eachMatch.val().time)) {
                db.ref('Matches/' + eachMatch.key + '/').set({});
            }
        })
        console.log('Cleared old matches.')
    })
    setTimeout(() => {
        clearOldMatches();
    }, 43200000);
}

module.exports = {
	dbTeamName,
    dbNextGame,
    clearOldMatches
}