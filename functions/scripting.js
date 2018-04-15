const request = require('request');
const data = require('../data/get_data.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const handleCases = require('./handleCases.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

function scriptingTeamName(key) {
    db.ref('Teams/').child(key.toUpperCase()).once('value', function(snapshot) {
        if (!snapshot.exists()) {
        	console.log('Looking for: ' + key.toUpperCase());
            data.get_team_name(key, (err, reply) => {
                if (!err) {
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
            })
        }
    });
}

module.exports = {
	scriptingTeamName
}