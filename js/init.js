/**
 * Name:		init.js
 * Author: 		Eric Kurtzberg
 * Description:	initialization javascript for all pages
 */
 
// Initialize Firebase
var config = {
	apiKey: "AIzaSyDfTFjhKTTiK8NZbeVDCAs6eRVIFsAENfI",
	authDomain: "crackling-heat-2839.firebaseapp.com",
	databaseURL: "https://crackling-heat-2839.firebaseio.com",
	storageBucket: "crackling-heat-2839.appspot.com",
};
firebase.initializeApp(config);


var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
if(sPage != "index.html")
{
	$(".button-collapse").sideNav();
	$(".collapsible").collapsible({
		accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
	});

	for(var i=1; i<=17; i++)
	{
		$("#weeks-list").append("<li><a class='waves-effect'>Week "+i+"</a></li>");
	}
}
firebase.auth().onAuthStateChanged(function(user)
{
	if(user != null && sPage == "index.html")
	{
		//user is logged in
		window.location.href = "standings.html";
	}
	if(user == null)
	{
		if(sPage == "forgot-password.html");
		else if( sPage != "login.html")
			// No user is signed in.
			window.location.href = "login.html";
	}
}); 

