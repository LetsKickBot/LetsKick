// Test for webhook

const fetch = require('node-fetch');
let url = 'https://letskick.herokuapp.com';


describe('Testing GET webhook', () => {
  test('Should be 200 response', () => {
    expect.assertions(1);
    return fetch('https://letskick.herokuapp.com/webhook?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe',
    {method: 'GET'}).then(response => {
      expect(response.ok).toBe(true);
    })
  })
})

describe('Testing POST webhook', () => {
  test('Shoud be 200 response', () => {
    expect.assertions(1);
    let webhook = url + '/webhook';
    return fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "object": "page",
        "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]
      })
    }).then(response => {
      expect(response.ok).toBe(true);
    })
  })
})
