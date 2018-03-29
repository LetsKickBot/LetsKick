const BotTester = require('messenger-bot-tester');
 
describe('bot test', function() {
  // webHookURL points to where yout bot is currently listening 
  // choose a port for the test framework to listen on 
  const testingPort = 3100;
  const webHookURL = 'http://localhost:' + 1337 + '/webhook';
  const tester = new BotTester.default(testingPort, webHookURL);
  
  before(function(){
    // start your own bot here or having it running already in the background 
    // redirect all Facebook Requests to http://localhost:3100/v2.6 and not https://graph.facebook.com/v2.6 
    return tester.startListening();
  });
  
  it('hi', function(){
    const theScript = new BotTester.Script('132', '20');
    theScript.sendTextMessage('Players');  //mock user sending "hi" 
    theScript.sendTextMessage('Bale');
    theScript.sendTextMessage('Neymar');
    theScript.sendTextMessage('Baledasdas');
    theScript.expectTextResponses([   //either response is valid 
      'Hey!', 
      'Welcome',
    ]);
    return tester.runScript(theScript);
  });
})
