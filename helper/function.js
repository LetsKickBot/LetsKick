var file = require('./teamName')
var correctTeam = ""
var identityTeam = []

function checkSpellName(name) {
	name = name.replace(/\s/g,'').toUpperCase();
	for (var key in file) {
		array = file[key]
		team = key.replace(/\s/g,'').toUpperCase()
		// Check to see if the specific team name has duplicate with other team name at diffrent location
		if (team.indexOf(name) !== -1) {
			identityTeam.push(key)
		}
		for (var i in array) {
			// Check to see if the team name same as shortcut name
			if (name == array[i].replace(/\s/g,'').toUpperCase()) {
				correctTeam = key
				break
			//	Check to see if the specific team name has duplicate with other team name at same location
			} else if (name == array[i].replace(/\s/g,'').substring(0, name.length).toUpperCase()) {
				if (identityTeam.includes(key) == false) {
					identityTeam.push(key)
				}
			}
		}
	}
	switch(identityTeam.length) {
		case 0:
			return correctTeam
			break
		case 1:
			return identityTeam[0];
			break;
		default:
			return identityTeam
			break
	}
}