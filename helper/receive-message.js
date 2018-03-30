const
    bodyParser = require('body-parser'),
    request = require('request'),
    task = require('./function')

let handleChoice = {};

const handleMessage = (sender_psid, received_message) => {
    console.log(handleChoice);
    let response;
    console.log(received_message.text);
    let key = received_message.text;
    if (key.toUpperCase().includes("START")) {
        task.getStart(sender_psid);
    }
    else if (handleChoice[sender_psid] == 'PLAYER') {
        delete handleChoice[sender_psid];
        task.playerLookup(sender_psid, key);
    }
    else if (handleChoice[sender_psid] == 'TEAM') {
        delete handleChoice[sender_psid];
        task.matchLookup(sender_psid, key);
    }
    else {
        response = {
            "text": `Please begin by typing in 'Start'`,
        };
        task.callSendAPI(sender_psid, response);
    }
}

const handleQuickReply = (sender_psid, received_message) => {
    let response;
    let key = received_message.quick_reply.payload;
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
        task.callSendAPI(sender_psid, response);
    }
    else {
        response = {
            "text": `Invalid command`
        };
        console.log(response);
        task.callSendAPI(sender_psid, response);
    }
}

module.exports = {
  handleMessage,
  handleQuickReply
};
