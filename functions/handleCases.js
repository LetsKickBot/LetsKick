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

// Provides 11 popular team options
function popularTeam(sender_psid) {
    let key = ['Manchester United', 'Real Madrid', 'Barcelona', 'Chelsea', 'Manchester City', 'Paris Saint Germain', 'Arsenal', 'Liverpool', 'Germany', 'Brazil', 'Spain'];
    let response = {
        'text': `Please type a team you want or choose from some quick options below!!!`
    }
    sendResponse.quickReply(sender_psid, response, 'POPULART', key);
}

// Provides 11 popular players options
function popularPlayer(sender_psid) {
    let key = ['Ronaldo', 'Messi', 'Bale', 'Neymar', 'Hazard', 'Morata', 'Ozil', 'Kroos', 'Isco', 'Alexis', 'Salad'];
    let response = {
        'text': `Please type a player you want or choose from some quick options below!!!`
    }
    sendResponse.quickReply(sender_psid, response, 'POPULARP', key);
}

// Repeats the main bot function.
function getContinue(sender_psid) {
    let key = ['Yes', 'No'];
    let response = {
        'text': 'Do you want to get back to the START?'
    }
    sendResponse.quickReply(sender_psid, response, 'CONTINUE', key);
}

function askReminder(sender_psid, match) {
    let key = ['Yes', 'No'];
    let response = {
        'text': 'Do you want to Set Reminder for this match?'
    }
    sendResponse.sendReminder(sender_psid, response, 'REMINDER', match);
}

function setReminder(sender_psid, key) {
    var matchInfo = (dataFormat.decodeUnderline(key))[1];
    db.ref('Matches/' + dataFormat.cleanKeyDB(matchInfo) + '/').once('value', (match) => {
        var timeDif = (new Date(match.val().time)) - (new Date());
        if (timeDif > 2147483616) {
            var response = {
                'text': "Sorry, We cannot set reminder because the match is too far away."
            };
            sendResponse.directMessage(sender_psid, response);
        }
        else if (timeDif > 0) {
            db.ref("Reminder/" + sender_psid + "/").push({
                "team": matchInfo,
                "time": (new Date(match.val().time)).getTime()
            })
            setTimeout(() => {
                var response = {
                    'text': `In 15 minutes:\n${match.val().team1} vs ${match.val().team2}`
                };
                sendResponse.directMessage(sender_psid, response);
            }, (new Date(match.val().time)) - (new Date()) - 900000);

            var response = {
                'text': 'Reminder is set.'
            };
            sendResponse.directMessage(sender_psid, response);
        }
        else if (timeDif < -7200000) {
            var response = {
                'text': 'This match has been played.'
            };
            sendResponse.directMessage(sender_psid, response);
        }
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
