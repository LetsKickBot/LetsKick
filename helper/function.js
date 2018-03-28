const file = require('../data/teamName.json');
const popular = require('../data/popularTeam.json');
const Data = require('../data/get_data.js');

const
    request = require('request');

function shortenName(name) {
    name = name.replace(/\s/g,'');
    var curIndex = 0;
    while (name[curIndex] != ":") {
        curIndex += 1;
    }
    curIndex += 1;
    return name.slice(curIndex);
}

function checkSpellName(name) {
    var correctTeam = "";
    var flag = true;
    var identityTeam = [];
    var savedName = name;
    name = shortenName(name).toUpperCase();

    for (var key in file) {
        if (flag) {
            array = file[key];
            team = key.replace(/\s/g,'').toUpperCase();
            // Check to see if the specific team name has duplicate with other team name at diffrent location
            if ((name.length >= 4) && team.indexOf(name) !== -1) {
                identityTeam.push(key);
            }
            for (var i in array) {
                // Check to see if the team name same as shortcut name
                if (name == array[i].replace(/\s/g,'').toUpperCase()) {
                    correctTeam = key;
                    flag = false;
                    break;
                //  Check to see if the specific team name has duplicate with other team name at same location
                } else if (name == array[i].replace(/\s/g,'').substring(0, name.length).toUpperCase()) {
                    if (identityTeam.includes(key) == false) {
                        identityTeam.push(key);
                    }
                }
            }
        } else {
            break;
        }
    }
    //Final Check
    // if (identityTeam.length)
    switch(identityTeam.length) {
        case 0:
            return savedName;
            break;
        case 1:
            return identityTeam[0];
            break;
        // Handle multiple teams
        default:
            return identityTeam;
            break;
    }
}

function completeName(key) {
    var newKey = "- "
    for (i = 0; i < key.length - 1; i++) {
        newKey = newKey + key[i] + "\n- ";
    }
    newKey += key[key.length-1];
    return newKey;
}

function timeFormat(inputTime, timezone) {
    var time = new Date(inputTime);
    time.setHours(time.getHours() + timezone);
    var hour = time.getHours();
    var minute = time.getMinutes();
    var date = time.getDate();
    var month = time.getMonth() + 1;
    var noon = " AM";
    if (hour > 12) {
        hour -= 12;
        noon = " PM";
    }
    if (hour == 12) {
        noon = " PM";
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    var answer = month + "/" + date + ", " + hour + ":" + minute + noon;
    return answer;
}

// Handle the UI quick replies
function quickReplies(value) {
    var finalArr = []
    for (i = 0; i < value.length; i++) {
        map = {};
        map["content_type"] = "text";
        map["title"] = "Team: " + value[i];
        map["payload"] = "team_" + value[i].toUpperCase().replace(/\s/g,'_');
        finalArr.push(map);
    }
    return finalArr;
}

// Team format
function teamFormat(team1, team2, key) {
    var check = team1;
    team1 = "Home team: " + team1.toUpperCase();
    team2 = "Away team: " + team2.toUpperCase(); 
    if (check != key) {
        return [team2, team1];
    }
    return [team1, team2];
}

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };
  // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/sv2.6/me/messages",
        // "uri": "http://localhost:3100/v2.6",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        } 
    });
}

function quickReply (sender_psid, response, value) {
    jsonFile = quickReplies(value);
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
        // "uri": "http://localhost:3100/v2.6",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        }
    });
}

function matchLookup(sender_psid, key) {
    if(typeof(key) == 'object') {
        newKey = completeName(key);
        response = {
          "text": `Did you mean:\n${newKey}\nOr please retype the team you want to see!!!`
        }
        quickReply(sender_psid, response, key);
    }
    else {
        response = {
            "text": `Please wait, we are retrieving information for ${key}...`
        };
        console.log("waiting...");
        callSendAPI(sender_psid, response);
        Data.get_next_game(key, (err, reply) => {
            if (err) {
                response = {
                    "text" : `Cannot find team: ${key}`
                }

                    // console.log(response);
                    
                callSendAPI(sender_psid, response);
            } 
            else if (key) {
                request({
                    "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                    "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                    "method": "GET",
                    "json": true,
                }, (err, res, body) => {
                    if (err) {
                        console.error("Unable to send message:" + err);
                    } 
                    else {
                        request({
                            "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                            "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                            "method": "GET",
                            "json": true,
                        }, (err, res, body) => {
                            let time = timeFormat(reply[2], body.timezone);
                            let team = teamFormat(reply[0], reply[1], key);
                            info = reply[3];
                            response = {
                                "text": 
                                `${team[0]}\n${team[1]}\nNext Match: ${time}\nLeague: ${info}`
                            };
                            console.log("replied");

                                        // console.log(response)

                            callSendAPI(sender_psid, response);
                        })
                    }
                })
            }
        })
    }
}

function playerLookup(sender_psid, key) {
    response = {
        "text": `Please wait, we are retrieving information for ${key}...`
    };
    console.log("waiting...");
    callSendAPI(sender_psid, response);
    Data.get_player_info(key, (err, reply) => {
        if (err) {
            response = {
                "text" : `Cannot find player: ${key}`
            };

                // console.log(response);

            callSendAPI(sender_psid, response);
        } 
        else if (key) {
            request({
                "uri": "https://graph.facebook.com/v2.6/" + sender_psid,
                "qs" : {"access_token": process.env.PAGE_ACCESS_TOKEN, fields: "timezone"},
                "method": "GET",
                "json": true,
            }, (err, res, body) => {
                if (err) {
                    console.error("Unable to send message:" + err);
                } 
                else {
                    var basicInfo = ['- Position: ', '- Height: ', '- Weight: ', '- Age: ', '- Date of Birth: ', '- Place of Birth: '];
                    var information = "";
                    var index = 0;
                    reply.forEach((val) => {
                        if (index != 0) {
                            information += "\n" + basicInfo[index] + val;
                        }
                        else {
                            information += basicInfo[index] + val;
                        }
                        index += 1;
                    })
                    response = {
                        "text" : information
                    }
                    console.log("replied");

                                // console.log(response);

                    callSendAPI(sender_psid, response);
                }
            })
        }
    })
}

module.exports = {
    shortenName,
    checkSpellName,
    timeFormat,
    teamFormat,
    completeName,
    quickReplies,
    callSendAPI,
    quickReply,
    matchLookup,
    playerLookup
};
