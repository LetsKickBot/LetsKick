const request = require('request');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

// Provides two options: Player and Team
function getStart(sender_psid) {
    let key = ['Player', 'Team'];
    request({
        "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
        "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "first_name"},
        "method": "GET",
        "json": true,
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
            } else {
            let userName = body.first_name;

            // Create the payload for a basic text message
            let response = {
                "text": `Hi ${userName}, Welcome to our Lets Kick bot. What are you looking for today?`
            }
            sendResponse.quickReply(sender_psid, response, 'START', key);
        }
    })
}

// Provides four options: Next Match, Team News, Team Squad, Next 5 games
function teamOptions(sender_psid, teamName, imageURL) {
    let choices = ['Next Match', 'Team News', 'Another Team'];
    sendResponse.teamOptionChoose(sender_psid, teamName, 'OPTION', choices, imageURL);
}

// Provides 6 popular teams options
function popularTeam(sender_psid) {
    db.ref("PopularTeams/").orderByChild("searchCount").limitToLast(6).once("value", (result) => {
        let teams = []
        result.forEach((team) => {
            teams.push(team.key);
        })
        let response = {
            'text': `Please type a team you want or choose from some quick options below!!!`
        }
        sendResponse.quickReply(sender_psid, response, 'POPULART', teams);
    })
}

// Provides 6 popular players options
function popularPlayer(sender_psid) {
    db.ref("PopularPlayers/").orderByChild("searchCount").limitToLast(6).once("value", (result) => {
        let playerNames = []
        result.forEach((playerName) => {
            playerNames.push(playerName.key);
        })

        let response = {
            'text': `Please type a player you want or choose from some quick options below!!!`
        }
        sendResponse.quickReply(sender_psid, response, 'POPULARP', playerNames);
    })
}

// Repeats the main bot function.
function getContinue(sender_psid) {
    let key = ['Yes', 'No'];
    let response = {
        'text': 'Do you want to get back to the START?'
    }
    sendResponse.quickReply(sender_psid, response, 'CONTINUE', key);
}

// Ask whether the user want to set reminder or not
function askReminder(sender_psid, match) {
    let response = {
        'text': 'Do you want to Set Reminder for this match?'
    }
    sendResponse.sendReminder(sender_psid, response, 'REMINDER', match);
}

// Set reminder
function setReminder(sender_psid, key) {
    var matchInfo = (dataFormat.decodeUnderline(key))[1];
    db.ref('Matches/' + dataFormat.cleanKeyDB(matchInfo) + '/').once('value', (match) => {
        var timeDif = (new Date(match.val().time)) - (new Date());

        // Cannot set reminder if time is over the limit of setTimeout
        if (timeDif > 2147483616) {
            var response = {
                'text': "Sorry, We cannot set reminder because the match is too far away."
            };
            sendResponse.directMessage(sender_psid, response);
        }

        // Set reminder using setTimeout
        else if (timeDif > 0) {

            // Save reminders to database
            db.ref("Reminders/" + sender_psid + "/").push(match.val())

            setTimeout(() => {
                var response = {
                    'text': `In ${new Date(timeDif).getMinutes()} minutes:\n${match.val().team1} vs ${match.val().team2}`
                };
                sendResponse.directMessage(sender_psid, response);

            }, timeDif - 910000);

            var response = {
                'text': 'Reminder is set.'
            };
            sendResponse.directMessage(sender_psid, response);
        }

        // Match is played
        else if (timeDif < -7200000) {
            var response = {
                'text': 'This match has been played.'
            };
            sendResponse.directMessage(sender_psid, response);
        }

        // Match is playing
        else {
            var response = {
                'text': `${match.val().team1} is playing again ${match.val().team2} right now`
            };
            sendResponse.directMessage(sender_psid, response);
        }
    })
}

module.exports = {
    getStart,
    teamOptions,
    popularTeam,
    popularPlayer,
    getContinue,
    askReminder,
    setReminder
}
