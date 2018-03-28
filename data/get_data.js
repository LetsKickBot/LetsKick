let PythonShell = require('python-shell');

module.exports = {
  get_next_game: function (team_name, callback) {
    PythonShell.run('./scripts/get_next_game.py', {args: [team_name]}, (err, data) => {
      callback(err, data);
    })
  },
  get_player_info: function (player_name, callback) {
    PythonShell.run('./scripts/get_player_info.py', {args: [player_name]}, (err, data) => {
      callback(err, data);
    })
  }
};
