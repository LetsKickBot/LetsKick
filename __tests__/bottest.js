const BotTester = require('messenger-bot-tester');
const read = require('syncprompt');

var input = read("Input: ");

describe('bot test', function() {
  const testingPort = 3100;

  const webHookURL = 'http://localhost:' + 1337 + '/webhook';

  const tester = new BotTester.default(testingPort, webHookURL);

  before(function(){
    return tester.startListening();
  });

  it('hi', function(){
    const script = new BotTester.Script('132', '20');
    script.sendTextMessage(input);
    return tester.runScript(script);
  });
})
