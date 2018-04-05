let firebase = require('firebase');
let fs = require('fs');

const config = {
	apiKey: "AIzaSyCjIHgfbmnB-zyOqpZjM6X7jSaorm083cg",
	authDomain: "letskick-7e0fc.firebaseapp.com",
	databaseURL: "https://letskick-7e0fc.firebaseio.com",
	projectId: "letskick-7e0fc",
	storageBucket: "",
	messagingSenderId: "130063148303"
};
firebase.initializeApp(config);

var db = firebase.database();

module.exports = {
	db
}
