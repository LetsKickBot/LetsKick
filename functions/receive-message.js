const bodyParser = require('body-parser');
const request = require('request');
const info = require('./informationLookup.js');
const handleCases = require('./handleCases.js');
const sendResponse = require('./sendResponse.js');
const dataFormat = require('./dataFormat.js');
const data = require('../data/get_data.js');
const updateDB = require('../functions/updateDB.js');

let bucket = require('../data/firebase.js');
let db = bucket.db;

let handleChoice = db.ref('HandleChoices/')

// Handle direct Message
function handleMessage(sender_psid, received_message) {
    let response;
    let key = received_message.text;

    // Update all the matches of the teams in Database/Teams
    if (key.toUpperCase() == "UPDATEMATCHESFROMTEAMS") {
        updateDB.updateMatchesFromTeams();
    }

    // Log out all the onGoing matches (currently observed)
    if (key.toUpperCase() == "ONGOING") {
        info.displayOnGoing();
    }

    // Log out status for running thread
    if (key.toUpperCase() == "RUNNING") {
        updateDB.getRunning();
    }

    // Users begin the search
    if (key.toUpperCase().includes("START")) {
        handleCases.getStart(sender_psid);
    }

    else {
        handleChoice.child(sender_psid).once("value", (snapshot) => {
            if (snapshot.exists()) {

                // Look for the Player
                if (snapshot.val().choice == "PLAYER") {
                    handleChoice.child(sender_psid).set({});
                    info.playerLookup(sender_psid, key);
                }

                // Look for the Team
                else if (snapshot.val().choice == "TEAM") {
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
                        handleChoice.child(sender_psid).set({});
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
        })
    }
}

// Handle Quick Reply
function handleQuickReply(sender_psid, received_message) {
    let response;
    let key = received_message.quick_reply.payload;

    // Identify the category user want to search
    if (key.includes('START')) {
        if (key.includes('Team')) {
            handleChoice.child(sender_psid).set({
                "choice": "TEAM"
            })
            handleCases.popularTeam(sender_psid);
        }
        else {
            handleChoice.child(sender_psid).set({
                "choice": "PLAYER"
            })
            handleCases.popularPlayer(sender_psid);
        }
    }

    // Handle duplicate Team Names
    if (key.includes('TEAMLIST')) {

        // Get the team Name from Payload.
        teamName = (dataFormat.decodeUnderline(key))[1];
        info.teamNameLookup(sender_psid, teamName);
    }

    // Handle the popular Teams
    if (key.includes('POPULART')) {

        // Get the team name from Payload
        var teamName = (dataFormat.decodeUnderline(key))[1];
        handleChoice.child(sender_psid).set({});
        info.teamNameLookup(sender_psid, teamName);
    }

    // Handle the popular Players
    else if (key.includes('POPULARP')) {

        // Get the player name from Payload
        var player = (dataFormat.decodeUnderline(key))[1];
        if (key.includes(player)) {
            handleChoice.child(sender_psid).set({});
            info.playerLookup(sender_psid, player);
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

    // handle Reminder answer.
    if (key.includes('REMINDER')) {

        // Set reminder for a match
        if (!(key.includes('ANOTHERTEAM'))) {
            if (key.includes('YES')) {
                handleCases.setReminder(sender_psid, key);
            }
            setTimeout(() => {
                handleCases.getContinue(sender_psid);
            }, 1000)
        }

        // Choose another team
        else {
            handleCases.anotherTeam(sender_psid);
        }
    }
}

function handlePostback(sender_psid, messagePostback) {
    let payload = messagePostback.payload;
    let response;
    if (payload.includes('OPTION')) {

        // Search for different player name
        if (payload.includes('ANOTHERPLAYER')) {
            handleCases.anotherPlayer(sender_psid);
        }

        // Search for different team name
        else if (payload.includes('Another Team')) {
            handleCases.anotherTeam(sender_psid)
        }

        // Looking for match's information
        else {
            teamName = (dataFormat.decodeUnderline(payload))[1];
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
