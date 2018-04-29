let firebase = require('firebase');
let fs = require('fs');
const info = require('../functions/informationLookup.js');
const dataFormat = require('../functions/dataFormat.js')
const data = require('./get_data.js');

const config = {
	apiKey: process.env.FIREBASE_APIKEY,
	authDomain: process.env.FIREBASE_AUTHDOMAIN,
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	projectId: process.env.FIREBASE_PROJECTID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID

};
firebase.initializeApp(config);

var db = firebase.database();



module.exports = {
	db
}
