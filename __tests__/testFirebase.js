let firebase = require('firebase');
let fs = require('fs');
const dataFormat = require('../functions/dataFormat.js');

const config = {
    apiKey: "AIzaSyCjIHgfbmnB-zyOqpZjM6X7jSaorm083cg",
    authDomain: "letskick-7e0fc.firebaseapp.com",
    databaseURL: "https://letskick-7e0fc.firebaseio.com",
    projectId: "letskick-7e0fc",
    storageBucket: "letskick-7e0fc.appspot.com",
    messagingSenderId: "130063148303"
}

firebase.initializeApp(config);

var db = firebase.database();

db.ref('Matches/').once('value', (newVal) => {
	newVal.forEach((newVal1) => {
		var firstName = (dataFormat.decodeUnderline(newVal1.key))[0];
		var secondName = (dataFormat.decodeUnderline(newVal1.key))[1];
		console.log(firstName + "   AND  " + secondName);
	})
})

module.exports = {
	db
}
	