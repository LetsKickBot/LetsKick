var file = require('./teamName')

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
		default:
			return identityTeam
			break
	}
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
	teamFormat
};