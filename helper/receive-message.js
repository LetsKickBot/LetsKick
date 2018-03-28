const
    bodyParser = require('body-parser'),
    request = require('request'),
    task = require('./function')


const handleMessage = (sender_psid, received_message) => {
    let response;
    console.log(received_message.text);
    let key = received_message.text;
    if (key.toUpperCase().includes("PLAYER")) {
        key = task.shortenName(key);
        console.log(key);
        task.playerLookup(sender_psid, key);
    }
    else if ((key.toUpperCase().includes("MATCH")) || (key.toUpperCase().includes("TEAM"))) {
        key = task.checkSpellName(received_message.text);
        console.log(key);
        task.matchLookup(sender_psid, key);
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
  handleMessage
};
