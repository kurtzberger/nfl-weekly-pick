/* global firebase */

/**
 * Name:			init.js
 * Author: 		Eric Kurtzberg
 * Description:	initialization javascript for all pages
 */

var LOAD_DELAY = 750; // in milliseconds
var SUPERUSER = "kurtzberger@gmail_com";	// allows to make picks for random, home, and away games
var curUser = null;
var UID = null;
var season = 2017;	// update this each season. This is used for the individual week league picks.
					// it's set static here instead of reading from NFL.com to save overhead.
var CUR_WEEK;	//	current NFL week
var KEYS;		

// Initialize Firebase
var config = {
	apiKey: "AIzaSyAOuHBEOKT9SIpsAChi7Z-gs6iJD5jp3jM",
	authDomain: "nfl-weekly-pick-app.firebaseapp.com",
	databaseURL: "https://nfl-weekly-pick-app.firebaseio.com",
	projectId: "nfl-weekly-pick-app",
	storageBucket: "nfl-weekly-pick-app.appspot.com",
	messagingSenderId: "466000753255"
};
firebase.initializeApp(config);
var database = firebase.database();
var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('pick/') + 5).slice(0, -1);	// get just the page name with no slashes
if (sPage === "") {
	$('head').append('<link rel="icon" type="image/ico" href="favicon.ico">');
}
else {
	$('head').append('<link rel="icon" type="image/ico" href="../favicon.ico">');
}

if (sPage !== "register") {
	firebase.auth().onAuthStateChanged(function (user) {	// on log in or log out
		if (user) {
			curUser = user;

			// get current week
			$.get('http://www.nfl.com/liveupdate/scorestrip/ss.xml', function (data) {
				var weekData = new WeekGames(data, function () {});
				if (weekData.seasonType === 'Preseason') {
					CUR_WEEK = 1;
				} else if (weekData.seasonType === 'Regular') {
					CUR_WEEK = weekData.week;
				} else {
					CUR_WEEK = 17;
				}
				// set UID here after CUR_WEEK is set since the call to $.get() is asynchronous
				UID = createUID(user.email);
				if (UID === SUPERUSER) {
					$('.superuser').show();
					if (sPage === "non-user-picks") {
						$('.show-me').toggle();
					}
				}
				
				if (sPage === "index.html" || sPage === "" || (sPage === "non-user-picks" && UID !== SUPERUSER)) {
					window.location.href = "standings";
				} else if (sPage === "change-password") {
					$("#current-user").html("Current user: <b>" + user.email + "</b>");
				}
			});	
		}
		else if (user === null) {
			if (sPage === "login/forgot-password.htm"); // do nothing
			else if (sPage === "register");	// do nothing
			else if ( sPage !== "login") {
				// No user is signed in.
				if (sPage === "index.html" || sPage === "") {
					setTimeout(function () { 
						window.location.href = "login";
					}, LOAD_DELAY);
				} else {
					setTimeout(function () { 
						window.location.href = "../login";
					}, LOAD_DELAY);
				}
			}
		}
	});
}