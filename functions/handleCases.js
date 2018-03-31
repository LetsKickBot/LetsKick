const  
    request = require('request');

// Provides two options: Player and Team
function getStart(sender_psid) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": `Please tell us what you want to look for!`,
            "quick_replies": [
                {
                    'content_type': 'text',
                    'title': 'Player',
                    'payload': 'START_PLAYER'
                },
                {
                    'content_type': 'text',
                    'title': 'Team',
                    'payload': 'START_TEAM'
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

function getContinue(sender_psid) {
    
}

module.exports = {
    getStart,
    getContinue
}