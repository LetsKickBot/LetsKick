let util = require('util');
let spawn = require('child_process').spawn;
let PythonShell = require('python-shell');

module.exports = {
  get_next_game: function (team_name, callback) {
    PythonShell.run('./scripts/get_next_game.py', {args: [team_name]}, (err, data) => {
      if (err) throw err;
      callback(data);
    })
  }
};
