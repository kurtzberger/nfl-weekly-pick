/* global firebase, LOAD_DELAY */

$(document).ready(function () {
    $("#headerTitle").text("Register");
    $("#retype-password").bind('keypress', function (e) {
        if ((e.keyCode || e.which) === 13) {
            $("#register-button").trigger("click");
        }
    });
	$('#confirmation').on('hidden.bs.modal', function () {
		$('#login-logout').trigger('click');
	});
    $("#main-content").on("click", "#register-button", function () {
        var flag = false;
        // replace button with loader animation
        $("#register-div").html(insertLoader());
        setTimeout(function () {
            if ($("#display-name").val() === "") {
                $.notify({
					// options
					icon: 'mdi mdi-alert',
					message: 'Please enter a display name.'
				},{
					// settings
					type: "danger",
					allow_dismiss: true,
					showProgressbar: true
				});
                flag = true;
            } else if (!isValidEmailAddress($('#email').val())) {
                $.notify({
					// options
					icon: 'mdi mdi-alert',
					message: 'Please enter a valid email address.'
				},{
					// settings
					type: "danger",
					allow_dismiss: true,
					showProgressbar: true
				});
                flag = true;
            } else if ($('#password').val() !== $('#retype-password').val()) {
				$.notify({
					// options
					icon: 'mdi mdi-alert',
					message: 'Passwords do not match! Please retype passwords.'
				},{
					// settings
					type: "danger",
					allow_dismiss: true,
					showProgressbar: true
				});
                flag = true;
            } else if ($('#password').val() === "") {
				$.notify({
					// options
					icon: 'mdi mdi-alert',
					message: 'Password cannot be blank! Please enter a password.'
				},{
					// settings
					type: "danger",
					allow_dismiss: true,
					showProgressbar: true
				});
                flag = true;
            } else {
                firebase.auth().createUserWithEmailAndPassword($('#email').val(), $('#password').val()).then(function (user) {
                    var name = $("#display-name").val();
                    user.updateProfile({
                        displayName: name
                    }); // update display name
                    firebase.database().ref('users/' + createUID(user.email)).update({
                        displayName: name
                    });
                    setTimeout(function () {
                        user.sendEmailVerification();
                    }, 1000); // delay sending confirmation email to allow display name to be updated
                    $("#modal-text").append("<p>Successfully created user account: <b>" + $('#email').val() + "</b></p>" +
                        "<p>A confirmation email is being sent to your email. Please confirm your account by clicking the link contained in the email before attempting to log in.</p><p>Thanks!</p>");
                    $("#main-content").html("");
                    $(".remove-me").remove();
					$('#confirmation').modal('show');
                }).catch(function (error) {
                    $.notify({
						// options
						icon: 'mdi mdi-alert',
						message: error
					},{
						// settings
						type: "danger",
						allow_dismiss: true,
						showProgressbar: true
					});
                    $('#register-div').html('<a id="register-button" class="btn btn-large btn-primary btn-block">Register</a>');
                });
            }
            if (flag) {
                $('#register-div').html('<a id="register-button" class="btn btn-large btn-primary btn-block">Register</a>');
            }
        }, LOAD_DELAY);
    });
});