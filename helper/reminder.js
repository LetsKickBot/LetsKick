var reminder = [];
var timeZone = new Date().getTimezoneOffdset();
console.log(timeZone)

// Set the schedule within the list
function createReminder(userID, time, data) {
	const reminderList = {}
	reminderList["UserId"] = userID
	reminderList["time"] = time
	reminderList["gameData"] = data

	return reminderList
}

// Put the schedule into any array such as queue
function setReminder(scheduleData) {
	//TODO: Check the time first before append to array, put in the
	//		in the right position. Time close to the localTime will
	// 		add near from the left.
	//		Implement such as queue

	return reminder.push(scheduleData)


	// TODO: send the message back to user said "Game scheduled. We will notify when the game about to start"
}

// Analyze the time data
// Should let it keep running checking api entire time
function implementReminder(reminderArray) {
	for(i = 0; i < reminderArray.length; i++) {
		user = reminderArray[i]

		switch (localTime.now() - user["time"]) {
			case 30:
				return "Your team will play in 30 minutes"
				break
			case 15:
				return "Your team will play in 15 minutes"
				break
			case 5:
				return "You team will play in 5 minutes"
				break
			case 0:
				return "your team is playing now!!!"
				reminderArray.pop(i) // Time already passed, remove the schedule in data
				break
			default: // Maybe not this case
				time = localTime.now() - user["time"]
				return "You time will play in " + time + " minutes"
				break 
		}
	}

	//TODO: Send the return statement to the users message
}


