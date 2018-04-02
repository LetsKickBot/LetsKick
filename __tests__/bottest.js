const BotTester = require('messenger-bot-tester');

describe('bot test', function() {
  // webHookURL points to where yout bot is currently listening
  // choose a port for the test framework to listen on
  const testingPort = 3100;
  const webHookURL = 'http://localhost:' + 5000 + '/webhook';
  const tester = new BotTester.default(testingPort, webHookURL);

  before(function(){
    // start your own bot here or having it running already in the background
    // redirect all Facebook Requests to http://localhost:3100/v2.6 and not https://graph.facebook.com/v2.6
    return tester.startListening();
  });

  it('hi', function(){
    const script = new BotTester.Script('132', '20');
    script.sendTextMessage('Atletico Madrid');  //mock user sending "hi"
    script.sendTextMessage('Arsenal');
    return tester.runScript(script);
  });
})
