var file = require('./teamName')
var popular = require('./popularTeam')
var getData = require('../data/get_data')
const Player = require('../data/get_player')
const request = require('request');

// Check the Team Spell name
function checkSpellName(name) {
	var correctTeam = ""
	var flag = true
	var identityTeam = []
	var oldName = name;
	name = name.replace(/\s/g,'').toUpperCase();
	for (var key in file) {
		if (flag) {
			array = file[key]
			team = key.replace(/\s/g,'').toUpperCase()
			// Check to see if the specific team name has duplicate with other team name at diffrent location
			if ((name.length >= 4) && team.indexOf(name) !== -1) {
				identityTeam.push(key)
			}
			for (var i in array) {
				// Check to see if the team name same as shortcut name
				if (name == array[i].replace(/\s/g,'').toUpperCase()) {
					correctTeam = key
					flag = false
					break
				//	Check to see if the specific team name has duplicate with other team name at same location
				} else if (name == array[i].replace(/\s/g,'').substring(0, name.length).toUpperCase()) {
					if (identityTeam.includes(key) == false) {
						identityTeam.push(key)
					}
				}
			}
		} else {
			break
		}
	}	

	//Final Check		
	switch(true) {
		case (identityTeam.length == 0):
			switch (true) {
				case (correctTeam == ''):
					return ""
					break
			}
		case (identityTeam.length == 1):
			return identityTeam[0]
			break;
		// Handle multiple teams
		case (identityTeam.length > 1):
			return identityTeam
			break
	}
}

// Check the Player Spell name
function checkPlayerName(message) {
	return message;
}

// Check the option that user pick
function optionChoose(name) {
	switch (name) {
		case 'Next Match':
		case 'Team News':
		case 'Team Squad':
		case 'Team Schedules':
			return name
			break
		default:
			return ""
			break
	}
}

// Fix the name of the team
function completeName(key) {
	newKey = ""
	for (i = 0; i < key.length - 1; i++) {
		newKey = newKey + key[i] + ", "
	}
	newKey += "or " + key[key.length-1]
	return newKey
}

// Format the time
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
	if (hour == 12) 
		noon = " PM";

	if (minute < 10)
		minute = "0" + minute;
	var answer = month + "/" + date + ", " + hour + ":" + minute + noon;
	return answer;
}

// Handle the UI quick replies
function quickReplies(value) {
	var finalArr = []
	for (i = 0; i < value.length; i++) {
		map = {}
		map["content_type"] = "text"
		map["title"] = value[i]
		map["payload"] = "value"
		finalArr.push(map)
	}
	return finalArr
}

// Handle the UI quick Options for Teams
function quickOptions() {
	optionTypes = [{
		"content_type": "text",
		"title": "Next Match",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Team News",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Team Squad",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Team Schedules",
		"payload": "value"
	}
	]
	return optionTypes
}

// Handle the UI quick replies for teams
function popularTeam() {
	optionTypes = [{
		"content_type": "text",
		"title": "Manchester United",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Real Madrid",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Barcelona",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Chelsea",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Manchester City",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Arsenal",
		"payload": "value"
	}]
	return optionTypes
}

// Handle the UI quick replies for players
function popularPlayers() {
	optionTypes = [{
		"content_type": "text",
		"title": "Ronaldo",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Messi",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Harzard",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Ozil",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Neymar",
		"payload": "value"
	}, {
		"content_type": "text",
		"title": "Bale",
		"payload": "value"
	}]
	return optionTypes
}

// Team format
function teamFormat(team1, team2, key) {
	var check = team1;
	team1 = "*" + team1 + "*" + "  _(Home team)_";
	team2 = "*" + team2 + "*" + "  _(Away team)_";
	if (check != key) {
		return [team2, team1];
	}
	return [team1, team2];
}

// Send the message back for users
function callSendAPI(sender_psid, response) {

    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
    }
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

// The QuickReply function
function quickReply(sender_psid, response, value) {
  jsonFile = quickReplies(value)
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
    }
    }
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


// The getStarted reply function
function getStarted(sender_psid, response) {
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": [{
        "content_type" : "text",
        "title": "Teams",
        "payload": "value"
      },{
        "content_type" : "text",
        "title": "Players",
        "payload": "value"
      }]
    }
    }
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

// The quickOption choose for users
function quickOption(sender_psid, team) {
  jsonFile = quickOptions(team)
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": "You choose " + team + ". Please select the option you want!!!",
      "quick_replies": jsonFile
    }
    }
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

// The quickTeams choose for users
function quickTeams(sender_psid, response) {
  jsonFile = popularTeam();
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
    }
    }
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

// The quickTeams choose for users
function quickPlayers(sender_psid, response) {
  jsonFile = popularPlayers();
    let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": {
      "text": response["text"],
      "quick_replies": jsonFile
    }
    }
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

module.exports = {
	checkSpellName,
	timeFormat,
	teamFormat,
	completeName,
	quickReplies,
	popularTeam,
	quickOptions,
	optionChoose,
	checkPlayerName,
	popularPlayers,
	quickTeams,
	quickReply,
	callSendAPI,
	getStarted,
	quickPlayers,
	quickOption
};