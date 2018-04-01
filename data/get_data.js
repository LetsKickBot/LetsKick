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
  }
};
