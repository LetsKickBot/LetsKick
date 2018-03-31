let PythonShell = require('python-shell');

module.exports = {
  get_next_game: function (team_name, callback) {
    PythonShell.run('./scripts/get_next_game.py', {args: [team_name]}, (err, data) => {
      spawn('killall', ['-9', 'chrome']);
      spawn('killall', ['-9', 'chromedriver']);
      callback(err, data);
    })
  }
};
