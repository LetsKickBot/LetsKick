const BotTester = require('messenger-bot-tester');
const read = require('syncprompt');

var input = read("Input: ");

describe('bot test', function() {
<<<<<<< HEAD
  // webHookURL points to where yout bot is currently listening
  // choose a port for the test framework to listen on
=======
>>>>>>> dc64faa169d379d7308280ea9555de10d246db56
  const testingPort = 3100;

  const webHookURL = 'http://localhost:' + 1337 + '/webhook';

  const tester = new BotTester.default(testingPort, webHookURL);

  before(function(){
<<<<<<< HEAD
    // start your own bot here or having it running already in the background
    // redirect all Facebook Requests to http://localhost:3100/v2.6 and not https://graph.facebook.com/v2.6
=======
>>>>>>> dc64faa169d379d7308280ea9555de10d246db56
    return tester.startListening();
  });

  it('hi', function(){
    const script = new BotTester.Script('132', '20');
<<<<<<< HEAD

    script.sendTextMessage(input);  //mock user sending "hi"
    // script.sendTextMessage('Arsenal');
=======
    script.sendTextMessage(input);
>>>>>>> dc64faa169d379d7308280ea9555de10d246db56
    return tester.runScript(script);
  });
})
