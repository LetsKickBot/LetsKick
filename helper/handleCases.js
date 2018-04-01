const request = require('request');
const sendResponse = require('./sendResponse.js');

// Provides two options: Player and Team
function getStart(sender_psid) {
    let key = ['Player', 'Team'];
    let response = {
        'text': 'Please tell us what information you want to look for.'
    }
    sendResponse.quickReply(sender_psid, response, 'START', key);
}

// Provides four options: Next Match, Team News, Team Squad, Next 5 games
function teamOptions(sender_psid, key) {
    let group = ['Next Match', 'Teams News', 'Teams Squad']
    let response = {
        'text': `You choose ${key}. Please select the options you want for the team!`
    }
    sendResponse.quickReply(sender_psid, response, 'OPTION', group);
}

// Provides 11 popular team options
function popularTeam(sender_psid) {
    let key = ['Manchester United', 'Read Madrid', 'Barcelona', 'Chelsea', 'Manchester City', 'PSG', 'Arsenal', 'Liverpool', 'Germany', 'Brazil', 'Spain'];
    let response = {
        'text': `Please type a team you want or choose from some quick options below!!!`
    }
    sendResponse.quickChoose(sender_psid, response, 'value', key);
}

// Provides 11 popular players options
function popularPlayer(sender_psid) {
    let key = ['Ronaldo', 'Messi', 'Bale', 'Neymar', 'Hazard', 'Morata', 'Ozil', 'Kroos', 'Isco', 'Alexis', 'Salad'];
    let response = {
        'text': `Please type a player you want or choose from some quick options below!!!`
    }
    sendResponse.quickChoose(sender_psid, response, 'value', key);
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
