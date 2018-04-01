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
    getContinue
}