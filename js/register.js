$(document).ready(function()
{	
	$(".button-collapse").sideNav({
		menuWidth: 280, // Default is 240
		edge: 'left', // Choose the horizontal origin
	});
	$(".collapsible").collapsible({
		accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
	});

	$("#headerTitle").text("Register");
	$("#retype-password").bind('keypress', function(e)
	{
		if((e.keyCode || e.which) === 13)
			$("#register-button").trigger("click");
	});
	$("#main-content").on("click", "#register-button", function()
	{
		var flag = false;
		// replace button with loader animation
		$("#register-div").html('<div class="s12 m4 center">' +
			'<div class="preloader-wrapper big active">' +
			'<div class="spinner-layer spinner-blue-only">' +
			'<div class="circle-clipper left">' +
			'<div class="circle"></div>' +
			'</div><div class="gap-patch">' +
			'<div class="circle"></div>' + 
			'</div><div class="circle-clipper right">' +
			'<div class="circle"></div></div></div></div></div>');
		setTimeout(function()
		{ 	
			if($("#display-name").val() === "") {
				Materialize.toast('Please enter a display name.', 4000, "red darken-1");
				flag = true;
			}
			else if(!isValidEmailAddress($('#email').val())) {
				Materialize.toast('Please enter a valid email address', 4000, "red darken-1");
				flag = true;
			} else if($('#password').val() !== $('#retype-password').val()) {
				Materialize.toast('Passwords do not match! Please retype passwords.', 4000, "red darken-1");
				flag = true;
			} else if($('#password').val() === "") {
				Materialize.toast('Passwords cannot be blank! Please retype passwords.', 4000, "red darken-1");
				flag = true;
			} else {
				firebase.auth().createUserWithEmailAndPassword($('#email').val(), $('#password').val()).then(function(user)
				{
					var name = $("#display-name").val()
					user.updateProfile({displayName: name});	// update display name
					firebase.database().ref('users/' + createUID(user.email)).update({
						displayName:	name
					});
					setTimeout(function() { user.sendEmailVerification(); }, 1000);	// delay sending confirmation email to allow display name to be updated
					$("#modal-text").append("<p>Successfully created user account: <b>" + $('#email').val() + "</b></p>" +
						"<p>A confirmation email is being sent to your email. Please confirm your account by clicking the link contained in the email before attempting to log in.</p><p>Thanks!</p>");
					$("#main-content").html("");
					$(".remove-me").remove();
					$("#confirmation").openModal({
						complete: function() { $("#login-li").trigger("click"); } // Callback for Modal close
					});
				}).catch(function(error)
				{
					Materialize.toast(error, 4000, "red darken-1");
					$('#register-div').html('<a id="register-button" class="btn waves-effect waves-light blue-grey lighten-1 col s2 offset-s5">Register</a>');
				});
			}
			if(flag) $('#register-div').html('<a id="register-button" class="btn waves-effect waves-light blue-grey lighten-1 col s2 offset-s5">Register</a>');
		}, LOAD_DELAY);
	});
});