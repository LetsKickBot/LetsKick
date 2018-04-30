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
        console.log("In team")
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
        teamName = dataFormat.decodeUnderline(key);
        info.teamNameLookup(sender_psid, teamName);
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

    // In case that user want to get the team datas
    if (key.includes('TEAMDATA')) {

        if (key.includes('Go Back')) {
            handleCases.getStart(sender_psid);
        }
        
        else {
            teamName = dataFormat.decodeUnderline(key);
            info.matchLookup(sender_psid, teamName, key);
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

    // Sets reminder for a match
    if (key.includes('REMINDER')) {
        if (key.includes('YES')) {
            var matchInfo = dataFormat.decodeUnderline(key);
            db.ref('Matches/' + matchInfo + '/').once('value', (match) => {
                setTimeout(() => {
                    var response = {
                        'text': `In 2 minutes:\n${match.val().team1} vs ${match.val().team2}`
                    };
                    sendResponse.directMessage(sender_psid, response);
                }, (new Date(match.val().time)).getTime() - (new Date()).getTime() - 120000);
            })
        }
        setTimeout(() => {
            handleCases.getContinue(sender_psid);
        }, 1000)
    }
}

function handlePostback(sender_psid, messagePostback) {
    let payload = messagePostback.payload;
    let response;
    if (payload.includes('OPTION')) {

        // Search for different player name
        if (payload.includes('ANOTHERPLAYER')) {
            handleChoice[sender_psid] = 'PLAYER';
            response = {
                'text': 'Please give us the player name'
            };
            sendResponse.directMessage(sender_psid, response);
        }

        // Search for different team name
        else if (payload.includes('Another Team')) {
            handleChoice[sender_psid] = 'TEAM';
            response = {
                'text': 'Please give us the team name'
            };
            sendResponse.directMessage(sender_psid, response); 
        }

        else if (payload.includes('Team Data')) {
            teamName = dataFormat.decodeUnderline(payload);
            console.log('In postback team: ', teamName);
            handleCases.teamData(sender_psid, teamName);
        }

        // Looking for match's information
        else {
            teamName = dataFormat.decodeUnderline(payload);
            info.matchLookup(sender_psid, teamName, payload);
        }
    }

    // Jump back to 'Start' option
    if (payload == 'BACKTOSTART') {
        handleMessage(sender_psid, { 'text' : 'START'})
    }
}

module.exports = {
  handleMessage,
  handleQuickReply,
  handlePostback
};