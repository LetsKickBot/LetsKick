var fs = require('fs')
var file = require('./teamName')
// var teamName = fs.readFileSync('./teamName.json', 'utf8')
// var jsonContent = (JSON.parse(teamName))
var correctTeam = ""
function checkSpellName(name) {

	for (var key in file) {
		array = file[key]
		for (var i in array) {
			if (name.toUpperCase() == array[i].toUpperCase()) {
				correctTeam = key
				break
			}
		}
	}

	return correctTeam
}
module.exports = {
	checkSpellName
};