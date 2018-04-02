const request = require('request');
const sendResponse = require('./sendResponse.js');

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
function teamOptions(sender_psid, key) {
    let group = ['Next Match', 'Team News ', 'Team Squad']
    let response = {
        'text': `You choose ${key}. Please select the options you want for the team!`
    }
    sendResponse.teamOptionChoose(sender_psid, response, 'OPTION', group, key);
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
        'text': 'Do you want to continue?'
    }
    sendResponse.quickReply(sender_psid, response, 'CONTINUE', key);
}

module.exports = {
    getStart,
    teamOptions,
    popularTeam,
    popularPlayer,
    getContinue
}
