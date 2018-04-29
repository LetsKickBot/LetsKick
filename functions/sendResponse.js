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
function teamOptionChoose(sender_psid, teamName, payloadCharacteristic, choices, imageURL) {

    // Sample Button: 
    // {
    //     'type' : 'postback',
    //     'title': 'Next Match',
    //     'payload': 'OPTIONNext Match_Chelsea'
    // }
    let button = dataFormat.teamOptionFormat(payloadCharacteristic, choices, teamName);
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": 'generic',
                    "image_aspect_ratio": 'square',
                    "elements": 
                    [
                        {
                            "title": teamName.toUpperCase(),
                            "image_url": imageURL,
                            "buttons": button
                        }
                    ]
                }
            }
        }
    }

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

// Post a form of quick reply to the server with teamNews
function teamNewsURL(sender_psid, key, url, imageUrl, newsTitle, newsSubtitle) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "image_aspect_ratio": 'square',
                    "elements": [{
                        "title": newsTitle,
                        "subtitle": newsSubtitle,
                        "image_url": imageUrl,
                        "buttons": [
                        {
                            "type": 'web_url',
                            "url": url,
                            "title": 'View More'
                        }, 
                        {
                            "type": 'element_share',
                            "share_contents": 
                            {
                                "attachment": 
                                {
                                    "type": "template",
                                    "payload": 
                                    {
                                        "template_type": "generic",
                                        "image_aspect_ratio": 'square',
                                        "elements": [
                                        {
                                            "title": newsTitle,
                                            "subtitle": newsSubtitle,
                                            "image_url": imageUrl,
                                            "buttons": [
                                            {
                                                "type": 'web_url',
                                                "url": url,
                                                "title": 'View More'
                                            }]
                                        }]
                                    }
                                }
                            }
                        }]
                    }]
                }
            }
        }
    };
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

// Options for player lookup
function playerReply(sender_psid, title, subtitle, imageURL, infoURL) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": 'generic',
                    "image_aspect_ratio": 'square',
                    "elements": 
                    [
                        {
                            "title": title,
                            "subtitle": subtitle,
                            "image_url": imageURL,
                            "buttons": 
                            [
                                {
                                    "type": 'web_url',
                                    "url": infoURL,
                                    "title": 'More Information'
                                },
                                {
                                    "type": 'postback',
                                    "title": 'Another Player',
                                    "payload": 'OPTIONANOTHERPLAYER'
                                },
                                {
                                    "type": 'postback',
                                    "title": 'Back to START',
                                    "payload": 'BACKTOSTART'
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
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

function sendReminder(sender_psid, response, payloadCharacteristic, match) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": response["text"],
            "quick_replies": 
            [  
                {
                    'content_type': 'text',
                    'title': 'Yes',
                    'payload': payloadCharacteristic + 'YES_' + match  
                },
                {
                    'content_type': 'text',
                    'title': 'No, thanks',
                    'payload': payloadCharacteristic + 'NO'
                },
                {
                    'content_type': 'text',
                    'title': 'Another Team',
                    'payload': payloadCharacteristic + 'ANOTHERTEAM'
                }
            ]
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
    teamNewsURL,
    playerReply,
    sendReminder
};
