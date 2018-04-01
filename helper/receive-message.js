const bodyParser = require('body-parser');
const request = require('request');
const info = require('./informationLookup.js');
const handleCases = require('./handleCases.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');

let handleChoice = {};
let teamHold = []

// Handle direct Message
const handleMessage = (sender_psid, received_message) => {
    let response;
    let key = received_message.text;
    console.log(key);

    // Users begin the search
    if (key.toUpperCase().includes("START")) {
        handleCases.getStart(sender_psid);
    }

    // Look for the Player
    else if (handleChoice[sender_psid] == 'PLAYER') {
        console.log("In Player section");
        console.log(handleChoice);
        delete handleChoice[sender_psid];
        info.playerLookup(sender_psid, key);
    }

    // Look for the Team
    else if (handleChoice[sender_psid] == 'TEAM') {
        console.log("In Team section");
        key = dataFormat.checkDuplicate(key);
        // teamHold.push[key];
        if (typeof(key) == 'object') {
            let newKey = dataFormat.completeName(key);
            response = {
              "text": `Did you mean:\n${newKey}\nOr please retype the team you want to see!!!`
            }
            sendResponse.quickReply(sender_psid, response, 'TEAMLIST', key);
        } else {
            console.log(handleChoice);
            delete handleChoice[sender_psid];
            info.matchLookup(sender_psid, key);
            // handleCases.teamOptions(sender_psid, key);
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
const handleQuickReply = (sender_psid, received_message) => {
    let response;
    let key = received_message.quick_reply.payload;
    // let oldKey = received_message.text;

    // Identify the category user want to search
    if (key.includes('START_')) {
        if (key.includes('TEAM')) {
            handleChoice[sender_psid] = 'TEAM';
            // response = {
            //     'text': 'Please give us the Team Name.'
            // }
            handleCases.popularTeam(sender_psid);
        }
        else {
            handleChoice[sender_psid] = 'PLAYER';
            // response = {
            //     'text': 'Please give us the Player Name.'
            // }
            handleCases.popularPlayer(sender_psid);
        }
        // sendResponse.directMessage(sender_psid, response);
    }

    // Handle duplicate Team Names
    if (key.includes('TEAMLIST')) {

        // Get the team Name from Payload.
        key = key.slice(9);
        delete handleChoice[sender_psid];
        info.matchLookup(sender_psid, key);
        // handleCases.teamOptions(sender_psid, key);
    }

    // Handle the popular Teams
    if (key.includes('POPULART_')) {
        var team = key.substring(9, key.length);
        if (key.includes(team)) {
            info.matchLookup(sender_psid, team);
        }
    }
    // Handle the Next Match option payload
    // if (key.includes('OPTION_')) {
    //     if (key.includes('NEXT MATCH')) {
    //         delete handleChoice[sender_psid];
    //         console.log('get here');
    //         // console.log('array: ', teamHold[0]);
    //         info.matchLookup(sender_psid, teamHold[0]);
    //         // teamHold = [];
    //     }
    // }

    // Continues the bot by asking the initial question: Team or Player?
    if (key.includes('CONTINUE')) {
        if (key.includes('YES')) {
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
