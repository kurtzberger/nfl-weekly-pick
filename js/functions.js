/* global Materialize, CUR_WEEK, season, database */

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
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function nonUserCheck(user)
{
	return	user === "placeholder@1_com" ||
			user === "placeholder@2_com" ||
			user === "placeholder@3_com";
}


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
  return Number.NaN;
}

/**
 * returns an HTML string for inserting the loading icon
 */
function insertLoader () {
	return '<div class="vertical-align loader"><div class="showbox"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div></div></div>';
}

/**
 * Calculate standings based on weeks specified in parameters object.
 * Default start/end weeks are current week to week one.
 * Callback function is optional
 * @param {Object} standings Standings Object
 * @param {Object} parameters Optional parameters (start: week to begin standings calulations, end: week to end standings calculations, callback: a callback function)
 * @returns {undefined}
 */
function processStandings(standings, parameters) {
	var parameters = parameters || {};
	var week = parameters.start || CUR_WEEK;
	var endWeek = parameters.end || 1;
	var callback = parameters.callback;
	var url;
	if (week === 'Preseason') {
		typeof callback === 'function' && callback();
		return;	// exit here if still in preseason
	} else if (week === CUR_WEEK) {
		url = 'http://www.nfl.com/ajax/scorestrip?season=2018&seasonType=REG&week=1';
	} else {
		url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
	}
	$.get(url, function(xml) {
		// create weekly data object from XML file imported
		var weekData = new WeekGames(xml, function() {
			database.ref(season + '/picks/week' + weekData.week).once('value').then(function(snapshot) {
				if (weekData.season !== season) {
					typeof callback === 'function' && callback();
					return;	// exit if the season read from NFL's website isn't equal to the global set season.
				}
				// get all picks from database
				var picks = snapshot.val();
				standings = calcStandings(picks, weekData, standings);
				standings.completedGames += weekData.completedGames;
				if (week > endWeek) {
					// recursively call this function again until endWeek is reached (base case).
					processStandings(standings, {
						start:		week - 1,
						end:		endWeek,
						callback:	callback
					});
				} else {
					typeof callback === 'function' && callback();
				}
			});
		});
	});
}

/**
 * Calculate the values for "standings" given the weekly data Object
 * @param {Object} picks User picks imported from the database
 * @param {Object} weekData WeekGames Object for the given NFL week
 * @param {Object} standings Standings Object with all the users' scores, wins, and points
 * @returns {unresolved}
 */
function calcStandings(picks, weekData, standings) {
	// enter possible unassigned points for this week, but if week is incomplete. Skip this.
	if (weekData.completedGames === weekData.games.length) {
		for (var i in standings) {
			if (i === 'completedGames') {
				continue;
			}
			standings[i].unassignedPoints = (weekData.completedGames * (weekData.completedGames + 1)) / 2;
		}
	}
	for (var i in picks) {
		for (var j in picks[i]) {
			var gamePick = picks[i][j];
			var game = weekData.getGame(gamePick.id);
			var points = filterFloat(gamePick.rank);
			// if user's pick was correct credit them points and if they were wrong discredit them points
			// skip over if game is incomplete
			if (game.winner) {
				if (gamePick.pick === game.winner.abbrName) {
					standings[i].points += points;
					standings[i].wins++;
				} else {
					standings[i].points -= points;
				}
			}
			// since a pick was found here, mark these points as "assigned", skip this if week is incomplete
			if (weekData.completedGames === weekData.games.length) {
				standings[i].unassignedPoints -= points;
			}
		}
	}
	// subtract any remaining unassigned points, but if week is incomplete. Skip this.
	if (weekData.completedGames === weekData.games.length) {
		for (var i in standings) {
			if (i === 'completedGames') {
				continue;
			}
			standings[i].points -= standings[i].unassignedPoints;
		}
	}
	return standings;
}

/**
 * Returns a sorted array of the passed "standings" object
 * @param {Object} standings Standings Object with all the users' scores, wins, and points
 * @param {bool} ranked Optional parameter of whether or not to sort by points or wins. The default value (false) will sort by wins
 * @returns {Array|sortStandings.sorted}
 */
function sortStandings(standings, ranked = false) {
	var sorted = [];
	for (var i in standings) {
		if (i === 'completedGames') {
			continue;
		}
		sorted.push(standings[i]);
	}
	sorted.sort(function (a, b) {
		if (a.points !== b.points && ranked) {
			return b.points - a.points;
		} else {
			return b.wins - a.wins;
		}
	});
	return sorted;
}

/**
 * Deletes inactive users. Inactive users are hardcoded into this function
 * @param {Object} users Users Object with all users read from firebase database
 * @returns {Object}
 */
function removeInactiveUsers(users) {
	for (var i in users) {
		if (i === 'jkurtzberg@charter_net' || i === 'kurtzal1@aol_com') {
			delete users[i];
		}
	}
	return users;
}