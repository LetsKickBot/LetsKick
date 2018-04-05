const file = require('../data/teamName.json');

function checkDuplicate(name) {
    let correctTeam = "";
    let flag = true;
    let identityTeam = [];
    let savedName = name;
    name = name.replace(/\s/g,'').toUpperCase();

    for (var key in file) {
        if (flag) {
            var array = file[key];
            var team = key.replace(/\s/g,'').toUpperCase();

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
    let newKey = "- "
    for (var i in key) {
        newKey = newKey + key[i] + "\n- ";
    }
    newKey += key[key.length-1];
    return newKey;
}

function timeFormat(inputTime, timezone) {
    let time = new Date(inputTime);
    let minute = time.getMinutes();
    let date = time.getDate();
    let month = time.getMonth() + 1;
    let noon = " AM";
    time.setHours(time.getHours() + timezone);
    let hour = time.getHours();
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
    let answer = month + "/" + date + ", " + hour + ":" + minute + noon;
    return answer;
}

function teamFormat(team1, team2, key) {
    let check = team1;
    team1 = "Home team: " + team1;
    team2 = "Away team: " + team2;
    if (check != key) {
        return [team2, team1];
    }
    return [team1, team2];
}

function quickReplyFormat(payloadCharacteristic, value) {
    let finalArr = [];
    for (var i = 0; i < value.length; i++) {
        var map = {};
        map['content_type'] = 'text';
        map['title'] = value[i];
        map['payload'] = payloadCharacteristic + '_' + value[i];
        finalArr.push(map);
    }
    return finalArr;
}

function teamOptionFormat(payloadCharacteristic, value, key) {
    let finalArr = [];
    for (var i = 0; i < value.length; i++) {
        var map = {};
        map['content_type'] = 'text';
        map['title'] = value[i];
        map['payload'] = payloadCharacteristic  + '_' + value[i] + '_' + key;
        finalArr.push(map);
    }
    return finalArr;
}

module.exports = {
    checkDuplicate,
    completeName,
    timeFormat,
    teamFormat,
    quickReplyFormat,
    teamOptionFormat
}
