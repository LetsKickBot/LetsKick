const spawn = require('child_process').spawn;
let PythonShell = require('python-shell');

module.exports = {
  get_next_game: function (team_name, callback) {
    PythonShell.run('./scripts/get_next_game.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  },
  get_player_info: function (player_name, callback) {
    PythonShell.run('./scripts/get_player_info.py', {args: [player_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  },
  get_team_name: function (team_name, callback) {
    PythonShell.run('./scripts/get_team_name.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  },
  get_team_squad: function (team_name, callback) {
    PythonShell.run('./scripts/get_team_squad.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  },
  get_team_schedule: function (team_name, callback) {
    PythonShell.run('./scripts/get_team_get_team_schedule.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  },
  get_team_news: function (team_name, callback) {
    PythonShell.run('./scripts/get_team_news.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  }
};
