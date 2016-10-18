$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		$("#change-password-link").addClass("deep-orange lighten-3");
		$("#headerTitle").text("Change your password");
		
		$("#retype-new-password").bind('keypress', function(e)
		{
			if((e.keyCode || e.which) === 13)
			{
				$("#password-change-button").trigger("click");
			}
		});
		$("#main-content").on("click", "#password-change-button", function()
		{
			var user = curUser;
			var flag = false;
			// replace button with loader animation
			$("#password-change-div").html('<div class="s12 m4 center">' +
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
				if($('#new-password').val() !== $('#retype-new-password').val())
				{
						Materialize.toast('Passwords do not match! Please retype passwords.', 4000, "red darken-1");
						flag = true;
				} else if($('#new-password').val() === "")
				{
						Materialize.toast('Passwords cannot be blank! Please retype passwords.', 4000, "red darken-1");
						flag = true;
				} else
				{
					firebase.auth().signInWithEmailAndPassword(user.email, $("#current-password").val()).then(function(u)
					{
						u.updatePassword($("#new-password").val()).then(function()
						{
							//update success
							$("#main-content").html("");
							$("#modal-text").append("<p>Successfully updated your password!</p>");
							$("#confirmation").openModal({
								complete: function() { $("#standings-link").trigger("click"); } // Callback for Modal close
							});
						}).catch(function(error)
						{
							Materialize.toast(error.message, 6000, "red darken-1");
							$("#password-change-div").html('<a id="password-change-button" class="btn waves-effect waves-light blue-grey lighten-1 col s2 offset-s5">Change Password</a>');
						});
					}, function(error)
					{
						if(error.code === "auth/wrong-password")
						{
							Materialize.toast('Current password is incorrect!', 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
						} else
						{
							Materialize.toast(error.message, 6000, "red darken-1");
						}
						$("#password-change-div").html('<a id="password-change-button" class="btn waves-effect waves-light blue-grey lighten-1 col s2 offset-s5">Change Password</a>');
					});
				}
				if(flag)
				{
					$("#password-change-div").html('<a id="password-change-button" class="btn waves-effect waves-light blue-grey lighten-1 col s2 offset-s5">Change Password</a>');
				}
			}, LOAD_DELAY);
		});
	});
});