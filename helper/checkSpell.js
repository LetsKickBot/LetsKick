var fs = require('fs')
var teamName = fs.readFileSync('teamName.json', 'utf8')
var jsonContent = (JSON.parse(teamName))
var correctTeam = ""
function checkSpellName(name) {
	
	for (var key in jsonContent) {
		array = jsonContent[key]
		for (var i in array) {
			if (name.toUpperCase() == array[i].toUpperCase()) {
				correctTeam = key
				break
			} else {
				return correctTeam = ""
				break
			}
		}
	}

	return correctTeam
}
console.log(checkSpellName("Bromwich"))

module.exports = {
	checkSpellName
};