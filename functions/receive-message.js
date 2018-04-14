const bodyParser = require('body-parser');
const request = require('request');
const info = require('./informationLookup.js');
const handleCases = require('./handleCases.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const data = require('../data/get_data.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

let handleChoice = {};

// Handle direct Message
function handleMessage(sender_psid, received_message) {
    let response;
    let key = received_message.text;

    // Users begin the search
    if (key.toUpperCase().includes("START")) {
        handleCases.getStart(sender_psid);
    }

    // Look for the Player
    else if (handleChoice[sender_psid] == 'PLAYER') {
        delete handleChoice[sender_psid];
        info.playerLookup(sender_psid, key);
    }

    // Look for the Team
    else if (handleChoice[sender_psid] == 'TEAM') {
        key = dataFormat.checkDuplicate(key);
        console.log(key);   
        if (typeof(key) == 'object') {
            let newKey = dataFormat.completeName(key);
            response = {
              "text": `Did you mean:\n${newKey}\nOr please retype the team you want to see!!!`
            }
            sendResponse.quickReply(sender_psid, response, 'TEAMLIST', key);
        } 
        
        else {
            delete handleChoice[sender_psid];
            info.teamNameLookup(sender_psid, key);
        }
    }

    // Instruction for user to use the Bot
    else {
        response = {
            "text": `Please begin by typing in 'Start'`,
        };
        sendResponse.directMessage(sender_psid, response);
    }
}

// Handle Quick Reply
function handleQuickReply(sender_psid, received_message) {
    let response;
    let key = received_message.quick_reply.payload;

    // Identify the category user want to search
    if (key.includes('START')) {
        if (key.includes('Team')) {
            handleChoice[sender_psid] = 'TEAM';
            handleCases.popularTeam(sender_psid);
        }
        else {
            handleChoice[sender_psid] = 'PLAYER';
            handleCases.popularPlayer(sender_psid);
        }
    }

    // Handle duplicate Team Names
    if (key.includes('TEAMLIST')) {

        // Get the team Name from Payload.
        key = key.slice(9);
        handleCases.teamOptions(sender_psid, key);
    }

    // Handle the popular Teams
    if (key.includes('POPULART')) {

        // Get the team name from Payload
        var teamName = dataFormat.decodeUnderline(key);
        delete handleChoice[sender_psid];
        info.teamNameLookup(sender_psid, teamName);
    }

    // Handle the popular Players
    else if (key.includes('POPULARP')) {

        // Get the player name from Payload
        var player = dataFormat.decodeUnderline(key);
        if (key.includes(player)) {
            delete handleChoice[sender_psid];
            info.playerLookup(sender_psid, player);
        }
    }

    // Handle the Next Match option payload
    if (key.includes('OPTION')) {

        // Get the player name from Payload
        var team = key.substring(18, key.length);
        var status = key.substring(7, 18);

        delete handleChoice[sender_psid];
        info.matchLookup(sender_psid, team, status);
    }

    // Continues the bot by asking the initial question: Team or Player?
    if (key.includes('CONTINUE')) {
        if (key.includes('Yes')) {
            handleCases.getStart(sender_psid);
        }
        else {
            response = {
                'text': 'Thank you for asking me! Please come back anytime you want!'
            }
            sendResponse.directMessage(sender_psid, response);
        }
    }
}

function handlePostback(sender_psid, messagePostback) {
    let payload = messagePostback.payload;
    let response;
    if (payload.includes('OPTION')) {
        teamName = dataFormat.decodeUnderline(payload);
        info.matchLookup(sender_psid, teamName, payload);
    }
    else {
        response = {
            'text': 'Nothing to do!'
        };
        sendResponse.directMessage(sender_psid, response);
    }
}

module.exports = {
  handleMessage,
  handleQuickReply,
  handlePostback
};
