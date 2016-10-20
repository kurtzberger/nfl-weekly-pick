/* global Materialize */

/**
 * Name:		functions.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for all custom functions
 */

/**
 * 
 * @param {type} emailAddress
 * @returns {Boolean}
 */
function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
}

/**
 * Submits all user's picks of current week to database.
 * @param database
 * @param path
 * @param user
 */
function submitPicks(database, path, user)
{
	var team, points, eid;
	var PickWithErrors = [];
	var noErrors = true;
	for(var i=0; i<$('#body tr').length; i++)
	{
		team = $('input[name=game'+ i +']:checked').val();
		points = $('#dropdown-' + i).val();
		if( typeof team === 'undefined' && points !== '' ||
			typeof team !== 'undefined' && points === '' )
		{
			PickWithErrors = $('input[name="game'+i+'"]').map(function()
			{
				  return $(this).attr('id');
			});
			Materialize.toast(PickWithErrors[0] + " @ " + PickWithErrors[1] + " not submitted. This pick needs both a team chosen AND a point assigned." , 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
			if(noErrors) noErrors = false;
		}
		eid = $('#body tr').eq(i).attr('id');
		// don't submit picks with not team selected or points assigned
		if(typeof team !== 'undefined' && points !== '')
		{			
			database.ref(path + '/' + eid + '/' + user).update({
				game:	i,
				pick:	team,
				points:	(points==='' ? 0 : parseInt(points))
			}).catch(function(error)
			{
				Materialize.toast('Submission failed ' + error.message, 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
				return false;
			});
		} else if(typeof team === 'undefined' && points === '') // if pick empty, ensure that the database reflects that in the case that the user reset the pick after submitting it.
		{
			database.ref(path + '/' + eid + '/' + user).remove().catch(function(error)
			{
				Materialize.toast('Submission failed ' + error.message, 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
				return false;
			});			
		}
	}
	return noErrors;
};

/**
 * 
 * @returns String - a funny phrase
 */
function funnyPhrase()
{
	var phrases = [
		"I am awesome!", "#MicDrop", "Nothing can stop me!", "Click here for no reason",
		"Good for you!", "If time is money... are ATMs Time Machines?", "If anything is possible, is it possible for something to be impossible?",
		"Two wrongs don't make a right, but two Wrights make a plane.", "Why do noses run while feet smell?", "Don't click me.", 
		"Ahh... look at all the lonely people.", "My picks are better than yours.", "Unbelievable!"];
		
	return phrases[Math.floor(Math.random() * phrases.length)];
};

/**
 * Takes the user's email address and creates a valid database entry
 * @param user
 * @returns A valid database UID.
 */
function createUID(user)
{
	var tempUID = '';
	tempUID = replaceAll(user, '.', '_');
	tempUID = replaceAll(tempUID, '$', '_');
	tempUID = replaceAll(tempUID, '#', '_');
	tempUID = replaceAll(tempUID, '[', '_');
	tempUID = replaceAll(tempUID, ']', '_');
	tempUID = replaceAll(tempUID, '/', '_');
	return tempUID.toLowerCase();
};

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function nonUserCheck(user)
{
	return	user === "placeholder@1_com" ||
			user === "placeholder@2_com" ||
			user === "placeholder@3_com";
};


/**
 * A stricter way of parsing floats. Will return an integer where possible, otherwise,
 * if number can be interpreted as a float, then a float will be returned.
 * @param value
 * @returns equivalent number (float or int) depending on if it can be interpreted as a float or int.
 */
function filterFloat (value) {
    if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
      .test(value))
      return Number(value);
  return NaN;
};