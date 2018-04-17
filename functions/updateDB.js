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

function updateMatches() {
    db.ref('Teams/').once('value', (val) => {
        val.forEach((val1) => {
            
            data.get_next_game(val1.key, (err, reply) => {
                if (err) {
                    console.log(err);
                }
                if (!err) {
                    console.log(reply[0]);

                    db.ref('Matches/' + reply[0].toUpperCase() + '/').set({
                        'team1': reply[0],
                        'team2': reply[1],
                        'time': reply[2],
                        'league': reply[3],
                        'url': reply[4]
                    });
                }
            })
        })
    })
}

module.exports = {
	dbTeamName
}