/* global UID, curUser, firebase */

$(function () {
	$("#header").load("../header.html", function() {
		wait(); // wait for global variables to be set
	});
});

/**
 * This function will wait for the global variables to be set before continuing to load the rest of the page.
 * When UID is set to a value, this indicates all other global variables have been set. 
 */
function wait() {
	if (UID === null) {
		setTimeout(function() {
			wait();
		}, 500);
	} else {
		loadPage();
	}
}

/**
 * Load all page elements for this page
 */
function loadPage() {
	$('#change-password-link').css({'font-weight': 'bold', 'background': '#b4b4b4'});
	$("#headerTitle").text('Change your password');
	
	$('#retype-new-password').bind('keypress', function(e) {
		if ((e.keyCode || e.which) === 13) {
			$('#password-change-button').trigger('click');
		}
	});
	
	$('#main-content').on('click', '#password-change-button', function() {
		var user = curUser;
		var html = $('#password-change-div').html();
		// replace button with loader animation
		$('#password-change-div').html(insertLoader());
		
		if ($('#new-password').val() !== $('#retype-new-password').val()) {
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
			$('#password-change-div').html(html);
		} else if ($('#new-password').val() === '') {
			$.notify({
				// options
				icon: 'mdi mdi-alert',
				message: 'Passwords cannot be blank! Please retype passwords.'
			},{
				// settings
				type: "danger",
				allow_dismiss: true,
				showProgressbar: true
			});
			$('#password-change-div').html(html);
		} else {
			firebase.auth().signInWithEmailAndPassword(user.email, $("#current-password").val()).then(function(u) {
				u.updatePassword($('#new-password').val()).then(function () {
					$.notify({
						// options
						icon: 'mdi mdi-check',
						message: 'Password successfully updated!'
					},{
						// settings
						type: "success",
						allow_dismiss: true,
						showProgressbar: true
					});
					$('#password-change-div').html(html);
				}).catch(function (error) {
					$.notify({
						// options
						icon: 'mdi mdi-alert',
						message: error.message
					},{
						// settings
						type: "danger",
						allow_dismiss: true,
						showProgressbar: true
					});
					$('#password-change-div').html(html);
				});
			}).catch(function (error) {
				if (error.code === 'auth/wrong-password') {
					$.notify({
						// options
						icon: 'mdi mdi-alert',
						message: 'Current Password is incorrect!'
					},{
						// settings
						type: "danger",
						allow_dismiss: true,
						showProgressbar: true
					});
				} else {
					$.notify({
						// options
						icon: 'mdi mdi-alert',
						message: error.message
					},{
						// settings
						type: "danger",
						allow_dismiss: true,
						showProgressbar: true
					});
				}
				$('#password-change-div').html(html);
			});
		}
	});
}
	


