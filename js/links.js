/*/**
 * Name:		links.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for handling all link click events
 */

$(document).ready(function()
{		
	/**
	 *	Load standings content
	 *	Based on current user it will make the user bold in standings table.
	 *	Only allow visit of this link if user is logged in.
	 */
	$("#standings-link").click(function()
	{
		var user = firebase.auth().currentUser;	// current user
		if(user==null)	// no user is logged in
		{
			Materialize.toast("Please log in first to access this page.", 4000, "red darken-1");
			setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
			return;
		}
		
		window.location.href = "standings.html";
	});
	
	/**
	 *  Load user picks content.
	 *  Based on current NFL week. Will grab XML data from NFL.com.
	 *  Upon loading, fill in any information that the current user has already submitted to the database.
	 */
	$("#user-picks-link").click(function()
	{
		var user = firebase.auth().currentUser;	// current user
		if(user==null)	// no user is logged in
		{
			Materialize.toast("Please log in first to access this page.", 4000, "red darken-1");
			setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
			return;
		}
		
		window.location.href = "user-picks.html";
	});
	
	/**
	 *	Load registration page; however, if current user is logged in
	 *	display an alert.
	 */
	$("#register-link").click(function()
	{
		var user = firebase.auth().currentUser;	// current user
		
		if(user!=null)	// user is already logged in
		{
			Materialize.toast("No need to register. You are already registered and logged in.", 4000);
			setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
			return;
		}
		
		$("#title").text("Register");
		$("#main-content").html('<div id="register"></div>');
		$("#register")
			//email field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<i class="mdi mdi-account-circle prefix"></i>' +
				'<input id="email" type="email">' + 
				'<label for="email" data-error="Please enter a valid email address" data-success="Valid email">Email</label></div></div>')
			//password field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<i class="mdi mdi-dots-horizontal prefix"></i>' +
				'<input id="password" type="password">' + 
				'<label for="password">Password</label></div></div>')
			//retype password field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<i class="mdi mdi-dots-horizontal prefix"></i>' +
				'<input id="retype-password" type="password">' + 
				'<label for="retype-password">Retype Password</label></div></div>')
			//register button
			.append('<div class="row"><a id="register-button" class="btn waves-effect waves-light col s2 offset-s5">Register</a></div>')
			//styling
			.css({"padding-top"	: "50px"});
		//delay to allow user to see click animation
		// close side bar when finished
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
	});
	
	$('#main-content').on('click', '#forgot-password', function()
	{
		$("#title").text("Forgot Password");
		$("#main-content").html('<div id="reset-password"></div>');
		$("#reset-password")
			//email field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<i class="mdi mdi-account-circle prefix"></i>' +
				'<input id="email" type="email">' + 
				'<label for="email">Email</label></div></div>')
			.append('<div class="row center-align"><p>An email will be sent to you with reset password link</p></div>')
			//login button
			.append('<div class="row"><a id="reset-password-button" class="btn waves-effect waves-light col s2 offset-s5">Reset Password</a></div>')
			//styling
			.css({"padding-top"	: "50px"});
	});
	
	$('#login-li').click(function()
	{
		var user = firebase.auth().currentUser;	// current user
		if(user != null)	// logged in
		{
			firebase.auth().signOut().then(function()
			{
				window.location.href = "login.html";
			}, function(error) {
				Materialize.toast(error.message, 4000, "red-darken-1");
			});
		}
	});
	
	$('#account-manage-link').click(function()
	{
		var user = ref.getAuth();	// current user
		
		if(user==null)	// no user is logged in
		{
			Materialize.toast("Please log in first to access this page.", 4000, "red darken-1");
			setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
			return;
		}
		
		$("#title").text("Account Management");
		$("#main-content").html('<div id="account-manage"></div>');
		$("#account-manage")
			.append('<div class="row center-align"><h4>Change Password</h4></div>')
			//change password
			.append('<div class="row"><div class="input-field col s6 push-s3">' +
				'<input id="current-password" type="password">' + 
				'<label for="current-password">Current Password</label></div></div>')
			//new password field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<input id="password" type="password">' + 
				'<label for="password">New Password</label></div></div>')
			//retype password field
			.append('<div class="row"><div class="input-field col s6 push-s3">' + 
				'<input id="retype-password" type="password">' + 
				'<label for="retype-password">Retype New Password</label></div></div>')
			//register button
			.append('<div class="row"><a id="change-password-button" class="btn waves-effect waves-light col s2 offset-s5">Change Password</a></div>')
			//styling
			.css({"padding-top"	: "50px"});
		//delay to allow user to see click animation
		// close side bar when finished
		setTimeout(function() { $(".button-collapse").sideNav("hide") }, 400);
	});
});