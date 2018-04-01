const request = require('request');
const sendResponse = require('./sendResponse.js');

// Provides two options: Player and Team
function getStart(sender_psid) {
    let options = ['Player', 'Team'];
    let response = {
        'text': 'Please tell us what information you want to look for.'
    };
    sendResponse.quickReply(sender_psid, response, 'START', options);
}

// Repeats the main bot function.
function getContinue(sender_psid) {
    let options = ['Yes', 'No'];
    let response = {
        'text': 'Do you want to continue?'
    };
    sendResponse.quickReply(sender_psid, response, 'CONTINUE', options);
}

function getReminder(sender_psid) {
    let options = ['Yes', 'No'];
    let response = {
        'text': 'Would you like to set a 3-minute reminder?'
    };
    sendResponse.quickReply(sender_psid, response, 'REMINDER', options);
}

function getTest(sender_psid) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": `LIONEL MESSI\nPosition: Forward\nHeight: 5'6" (1.69m)\nWeight: 148 lbs  (67 kg)`,
                            "image_url":"http://a.espncdn.com/combiner/i/?img=/soccernet/i/players/130x180/45843.jpg",
                            "subtitle": `Age: 30 \nDOB: June 24, 1987\nPOB: Santa Fe, Argentina`
                        }
                    ]
                }
            }
        }
    };

    console.log(request_body);
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
    getStart,
    getContinue,
    getReminder,
    getTest
}