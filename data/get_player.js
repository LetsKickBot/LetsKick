let PythonShell = require('python-shell');

module.exports = {
  get_player_infor: function (player_name, callback) {
    PythonShell.run('./scripts/get_player_infor.py', {args: [player_name]}, (err, data) => {
      callback(err, data);
    })
  }
};