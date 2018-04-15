let firebase = require('firebase');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCjIHgfbmnB-zyOqpZjM6X7jSaorm083cg",
    authDomain: "letskick-7e0fc.firebaseapp.com",
    databaseURL: "https://letskick-7e0fc.firebaseio.com",
    projectId: "letskick-7e0fc",
    storageBucket: "letskick-7e0fc.appspot.com",
    messagingSenderId: "130063148303"
};
firebase.initializeApp(config);

db = firebase.database();

// db.ref('Matches/').orderByChild('time').on("child_added", (val) => {
//   console.log(val.val());
// })
db.ref('Teams/').child('CANADA').once('value', (val) => {
    if (val.exists()) {
        console.log('Exists');
    }
    else {
        console.log('Non-exists');
    }
})