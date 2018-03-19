var file = require('./teamName')
var popular = require('./popularTeam')

function checkSpellName(name) {

	var correctTeam = ""
	var flag = true
	var identityTeam = []

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
	switch(identityTeam.length) {
		case 0:
			return correctTeam
			break
		case 1:
			return identityTeam[0]
			break;
		// Handle multiple teams
		default:
			return identityTeam
			break
	}
}

function optionChoose(name) {
	// First check
	switch (name) {
		case 'Next Match':
			return name
			break
		case 'Team News':
			return name
			break
		case 'Team Squad':
			return name
			break
		case 'Team Schedules':
			return name
			break
		default:
			return ""
			break
	}
}

function completeName(key) {
	newKey = ""
	for (i = 0; i < key.length - 1; i++) {
		newKey = newKey + key[i] + ", "
	}
	newKey += "or " + key[key.length-1]
	return newKey
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

// console.log(quickOptions('Manchester United'))

//Popular teams
function popularTeam() {
	arr = []
	for (var key in popular) {
		arr.push(key)
	}
	return arr
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

module.exports = {
	checkSpellName,
	timeFormat,
	teamFormat,
	completeName,
	quickReplies,
	popularTeam,
	quickOptions,
	optionChoose
};