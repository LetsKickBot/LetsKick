const bodyParser = require('body-parser');
const request = require('request');
const info = require('./informationLookup.js');
const handleCases = require('./handleCases.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');

let handleChoice = {};

// Handle direct Message
const handleMessage = (sender_psid, received_message) => {
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
            delete handleChoice[sender_psid];
            info.matchLookup(sender_psid, key);
        }
    }

    // Test reminder function for later use.
    else if (key.toUpperCase().includes('REMINDER')) {
        handleCases.getReminder(sender_psid);
    }

    else if (key.toUpperCase().includes('TEST')) {
        handleCases.getTest(sender_psid);
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

    // Identify the category user want to search
    if (key.includes('START_')) {
        if (key.includes('TEAM')) {
            handleChoice[sender_psid] = 'TEAM';
            response = {
                'text': 'Please give us the Team Name.'
            }
        }
        else {
            handleChoice[sender_psid] = 'PLAYER';
            response = {
                'text': 'Please give us the Player Name.'
            }
        }
        sendResponse.directMessage(sender_psid, response);
    }

    // Handle duplicate Team Names
    if (key.includes('TEAMLIST')) {

        // Get the team Name from Payload.
        key = key.slice(9);
        delete handleChoice[sender_psid];
        info.matchLookup(sender_psid, key);
    }

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

    if (key.includes('REMINDER')) {
        if (key.includes('YES')) {
            response = {
                'text': `IT'S 3 MINUTES ALREADY!!!`
            };
            setTimeout(() => {
                sendResponse.directMessage(sender_psid, response);
            }, 180000)


        }
        else {
            response = {
                'text': `Guess that a NO.`
            };
            sendResponse.directMessage(sender_psid, response);
        }
        setTimeout(() => {
            handleCases.getContinue(sender_psid);
        }, 1500)
    }
}

module.exports = {
  handleMessage,
  handleQuickReply
};
