const bodyParser = require('body-parser');
const request = require('request');
const info = require('./informationLookup.js');
const handleCases = require('./handleCases.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');

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
        if (typeof(key) == 'object') {
            let newKey = dataFormat.completeName(key);
            response = {
              "text": `Did you mean:\n${newKey}\nOr please retype the team you want to see!!!`
            }
            sendResponse.quickReply(sender_psid, response, 'TEAMLIST', key);
        } else {
            console.log(handleChoice);
            handleCases.teamOptions(sender_psid, key);
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
    if (key.includes('START_')) {
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
    if (key.includes('POPULART_')) {

        // Get the team name from Payload
        var team = key.substring(9, key.length);
        if (key.includes(team)) {
            handleCases.teamOptions(sender_psid, team);
        }
    }

    // Handle the popular Players
    else if (key.includes('POPULARP_')) {

        // Get the player name from Payload
        var player = key.substring(9, key.length);
        if (key.includes(player)) {
            delete handleChoice[sender_psid];
            info.playerLookup(sender_psid, player);
        }
    }

    // Handle the Next Match option payload
    if (key.includes('OPTION_')) {

        // Get the player name from Payload
        var team = key.substring(18, key.length);
        var status = key.substring(7, 18);

        // In case user want the Next Match Schedule
        if (key.includes('Next Match_')) {
            delete handleChoice[sender_psid];
            info.matchLookup(sender_psid, team, status);
        }

        // In case user want to see the lastest Team News
        else if (key.includes('Team News _')) {
            delete handleChoice[sender_psid];
            info.matchLookup(sender_psid, team, status);
        }

        // In case user want to see the Next Match Squad
        else if (key.includes('Team Squad_')) {
            delete handleChoice[sender_psid];
            info.matchLookup(sender_psid, team, status);
        }
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

module.exports = {
  handleMessage,
  handleQuickReply
};
