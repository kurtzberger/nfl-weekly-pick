/**
 * Name:		init.js
 * Author: 		Eric Kurtzberg
 * Description:	initialization javascript for all pages
 */

const LOAD_DELAY = 750; // in milliseconds
var SUPERUSER = "kurtzberger@gmail_com";	// allows to make picks for random, home, and away games
var curUser = null;
var UID = null;
var season = 2016; // update this each season. This is used for the individual week league picks.
				   // it's set static here instead of reading from NFL.com to save overhead.
var CUR_WEEK;	//	current NFL week (set inside of header.html)

// Initialize Firebase
var config = {
apiKey: "AIzaSyAOuHBEOKT9SIpsAChi7Z-gs6iJD5jp3jM",
authDomain: "nfl-weekly-pick-app.firebaseapp.com",
databaseURL: "https://nfl-weekly-pick-app.firebaseio.com"
};
firebase.initializeApp(config);
var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('pick/') + 5).slice(0, -1);	// get just the page name with no slashes

if(sPage !== "register")
{
	firebase.auth().onAuthStateChanged(function(user)	// on log in or log out
	{
		if(user)
		{
			curUser = user;
			UID = createUID(user.email);
			if(UID === SUPERUSER)
			{
				$("#menu-nav").append('<li id="non-user-li">\n\
					<a id="non-user-link" class="waves-effect"><i class="mdi mdi-account-alert left"></i><b>Non-Users\' Picks</b></a></li>');
				if(sPage === "non-user-picks") $('.show-me').toggle();
			}
			if(sPage === "index.html" || sPage == "" || (sPage === "non-user-picks" && UID !== SUPERUSER))	//user is logged in
				window.location.href = "standings";
			else if(sPage === "change-password")
				$("#current-user").html("Current user: <b>" + user.email + "</b>");
			else if(sPage === "user-picks")
			{
				var week = location.search.substring(1).split("&")[0].split("=")[1];
				$("#title").append(curUser.displayName + "'s " + season + " Week " + week + " Picks");
			}		
		}
		else if(user === null)
		{
			if(sPage === "login/forgot-password.htm");
			else if(sPage === "register");
			else if( sPage !== "login")
				// No user is signed in.
				if(sPage === "index.html" || sPage === "") setTimeout(function() { window.location.href = "login"; }, 600);
				else	setTimeout(function() { window.location.href = "../login"; }, 600);
		}
	});
}