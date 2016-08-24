/*/**
 * Name:		links.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for handling all link click events
 */

$(document).ready(function()
{		
	/**
	 *	Load standings page
	 *	Only allow visit of this link if user is logged in.
	 */
	$("#header").on("click", "#standings-link", function()
	{
		var user = firebase.auth().currentUser;	// current user
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
		if(user==null)	// no user is logged in
		{
			Materialize.toast("Please log in first to access this page.", 4000, "red darken-1");
		} else if(sPage != "standings")
		{
			if(sPage == "") setTimeout(function() { window.location.href = "standings"; }, 600);
			else if(sPage != "standings") setTimeout(function() { window.location.href = "../standings"; }, 600);
		}
	});
	
	/**
	 *  Load user picks page.
	 *	Only allow visit of this link if user is logged in.
	 */
	$("#header").on("click", "#user-picks-link", function()
	{
		var user = firebase.auth().currentUser;	// current user
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
		if(user==null)	// no user is logged in
		{
			Materialize.toast("Please log in first to access this page.", 4000, "red darken-1");
		} else if(sPage != "user-picks")
		{
			if(sPage != "user-picks") setTimeout(function() { window.location.href = "../user-picks"; }, 600);
		}
	});
	
	/**
	 *	Load registration page
	 */
	$("#header").on("click", "#register-link", function()
	{
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
		if(sPage != "register") setTimeout(function() { window.location.href = "../register"; }, 600);
	});
	
	/**
	 *	Load password change page
	 */
	$("#header").on("click", "#change-password-link", function()
	{
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
		if(sPage != "change-password")	setTimeout(function() { window.location.href = "../change-password"; }, 600);
	});
	
	$("#header").on("click", '#login-li', function()
	{
		var user = firebase.auth().currentUser;	// current user
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
		if(user != null)	// logged in
		{
			firebase.auth().signOut().then(function()
			{
				// additional logout stuff here
			}, function(error) {
				Materialize.toast(error.message, 4000, "red-darken-1");
			});
		}
		if(sPage != "login") setTimeout(function() { window.location.href = "../login"; }, 600);
	});
	
	/**
	 * 	Load League picks page depending on which week was clicked.
	 */
	$("#header").on('click', '.week', function()
	{
		var week = $(this).text().substr($(this).text().indexOf(" ") + 1);
		setTimeout(function() { $(".button-collapse").sideNav("hide"); }, 400);
		setTimeout(function() { window.location.href = "../league-picks?week="+week; }, 600);
	});
	
	/**
	 * 	Load user picks page depending on which week was clicked
	 */
	$("#header").on('click', '.user-pick', function()
	{
		var week = $(this).text().substr($(this).text().indexOf(" ") + 1);
		setTimeout(function() { $(".button-collapse").sideNav("hide"); }, 400);
		setTimeout(function() { window.location.href = "../user-picks?week="+week; }, 600);
	});
});