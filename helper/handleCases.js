const request = require('request');
const sendResponse = require('./sendResponse.js');
const info = require('./informationLookup.js');

// Provides two options: Player and Team
function getStart(sender_psid) {
    let key = ['Player', 'Team'];
    // let response = {
    //     'text': 'Please tell us what information you want to look for.'
    // }
    response = info.getUser_Name();
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
    getContinue
}