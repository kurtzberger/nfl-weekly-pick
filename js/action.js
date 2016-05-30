/**
 * Name:		action.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for handling all various actions with in a webpage
 */

// database reference
var ref = new Firebase('https://crackling-heat-2839.firebaseio.com/');

/** 
 * 	Capture each time an option is made from a select list.
 *	This function will remove (or add) option elements from other selection elements.
 *	That way each game will have a unique point value assigned to it.	
 */
$('#main-content').on('change', 'select', function()
{
	var Values = [];	// array of values
	var value, numberOfGames = $('#body tr').length;
	
	for(var i=0; i<=numberOfGames; i++)
	{
		// fill the array with all possible point values
		if(i==0)
			Values.push("");
		else
			Values.push(i);
	}
	
	for(var i=0; i<numberOfGames; i++)
	{
		value = $('#dropdown-' + i).val();									// get current selected value
		if(value != "")														// do not remove empty selection from array. This is always a valid selection in all elements.
			Values.splice(Values.indexOf(parseInt(value)), 1);				// remove selected value for array 
		$('#dropdown-' + i + ' option[value!="' + value + '"]').remove();	// remove all values EXCEPT selected
		if(value == "")
			$('#dropdown-' + i + ' option[value="' + value + '"]').remove();// remove empty selection from element (to be added back later). 
																			// if we don't remove the empty selection there will be a duplicate added in later.
	}
	for(var i=0; i<Values.length; i++)
	{
		for(var j=0; j<numberOfGames; j++)
		{
			value = $('#dropdown-' + j).val();
			//next two conditions insert selection options in order based on their value
			if(parseInt(value) > Values[i])
				$('<option value=' + Values[i] + '>' + Values[i] + '</option>').insertBefore($('#dropdown-' + j + ' option[value="' + value + '"]'));	// add smaller values before
			else
				$('#dropdown-' + j).append('<option value=' + Values[i] + '>' + Values[i] + '</option>');	// add larger values after
		}
	}
	$('select').material_select();	// update material select UI
});

/**
 * binds an action to login button.
 * since the button is dynamically generated we must bind the action to main-content
 */
$('#main-content').on('click', '#login-button', function()
{
	login(ref);
});

$('#main-content').on('keypress', '#password', function(e)
{
	if(e.keyCode==13)
	{
		//enter key pressed
		login(ref);
	}
});

/** 
 *  binds an action to register button.
 *  since the button is dynamically generated we must bind the action to main-content
 */
$('#main-content').on('click', '#register-button', function()
{
	//email address is not valid
	if(!isValidEmailAddress($('#email').val()))
		Materialize.toast('Please enter a valid email address', 4000, "red darken-1");
	else if($('#password').val() !== $('#retype-password').val())
		Materialize.toast('Passwords do not match! Please retype passwords.', 4000, "red darken-1");
	else if($('#password').val() === "")
		Materialize.toast('Passwords cannot be blank! Please retype passwords.', 4000, "red darken-1");
	else
	{
		ref.createUser({
			email		:	$('#email').val(),
			password	:	$('#password').val()	
		}, function(error, userData)
		{
			if(error)
				Materialize.toast("Error creating user: " + error, 4000, "red darken-1");
			else
			{
				Materialize.toast("Successfully created user account: " + $('#email').val(), 4000, "green darken-1");
				// call login page
				loginPage();
			}
		});
	}
});

/**
 *	Verifies a user's email address and then sends them an email with a 
 *	password reset link
 */
$('#main-content').on('click', '#reset-password-button', function()
{
	ref.resetPassword({
		email	: $('#email').val()
	}, function(error)
	{
		if(error)
		{
			switch(error.code)
			{
				case "INVALID_USER":
					Materialize.toast("The specified email is not associated with any user.", 4000, "red darken-1");
					break;
				default:
					Materialize.toast("Error resetting password:" +  error, 4000, "red darken-1");
			}
		} else 
		{
			Materialize.toast("Password reset email sent successfully!", 4000, "green darken-1");
			// call login page
			loginPage();
		}
	});
});

/**
 *	Checks current user's current password and new passwords
 *	if current password is correct and new passwords match then the user's password
 *	will be changed 
 */

$('#main-content').on('click', '#change-password-button', function()
{
	if($('#password').val() !== $('#retype-password').val())
		Materialize.toast('Passwords do not match! Please retype passwords.', 4000, "red darken-1");
	else if($('#password').val() === "")
		Materialize.toast('Passwords cannot be blank! Please retype passwords.', 4000, "red darken-1");
	else
	{
		ref.changePassword({
			email		:	ref.getAuth().password.email,
			oldPassword	:	$('#current-password').val(),
			newPassword	:	$('#password').val()
		}, function(error)
		{
			if(error)
			{
				switch(error.code)
				{
					case "INVALID_PASSWORD":
						Materialize.toast('The specified user account current password is incorrect.', 4000, "red darken-1");
						break;
					default:
						Materialize.toast('Error changing password.', 4000, "red darken-1");
				}
			} else
			{
				Materialize.toast("Password changed successfully!", 4000, "green darken-1");
				// go to standings page
				$('#standings-link').trigger('click');
				
			}
		});
	}
});