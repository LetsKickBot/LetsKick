const request = require('request');
const dataFormat = require('./dataFormat.js');

// Post a form of direct message to the server
function directMessage(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        }
    });
}

// Post a form of quick reply to the server
function quickReply(sender_psid, response, payloadCharacteristic, value) {
    let jsonFile = dataFormat.quickReplyFormat(payloadCharacteristic, value);
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": response["text"],
            "quick_replies": jsonFile
        }
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        }
    });
}

// Post a form of quick reply to the server
function teamOptionChoose(sender_psid, response, payloadCharacteristic, group, value) {
    let jsonFile = dataFormat.teamOptionFormat(payloadCharacteristic, group, value);
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": response["text"],
            "quick_replies": jsonFile
        }
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        }
    });
}

function teamNewsURL(sender_psid, url) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": 'Here is the team news',
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                            "title": 'News',
                            "subtitle": 'Welcome to Lets Kick',
                            "image_url": 'http://givemesport.azureedge.net/images/18/03/10/e401263ac48b0be301316480f1361e60/960.jpg',
                            "buttons": [{
                                    "type": 'web_url',
                                    "url": url,
                                    "title": 'More Information'
                                }]
                        }]
                }
            }
        }
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = {
    directMessage,
    quickReply,
    teamOptionChoose,
    teamNewsURL
}
