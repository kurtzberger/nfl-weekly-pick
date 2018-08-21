/* global CUR_WEEK, season, firebase, UID, KEYS, database */

$(function() {
	$("#header").load("../header.html", function() {
		wait(); // wait for global variables to be set
	});
});

/**
 * This function will wait for the global variable UID to be set before continuing to load the rest of the page.
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
	$("#standings-link").css('background-color', '#b4b4b4');
	$("#headerTitle").text("Standings");
	
	// get all users and create a standings object for those users.
	database.ref('users').once('value').then(function(snapshot) {
		var users = removeInactiveUsers(snapshot.val());
		var standings = {
			completedGames: 0
		};
		// get all display names from imported data and initialize stats for each user
		for (var i in users) {
			standings[i] = {
				name: users[i].displayName,
				points: 0,
				unassignedPoints: 0,
				wins: 0
			};
		}
		
		processStandings(standings, {
			callback:	function () {
				var rankedSorted = sortStandings(standings, true);
				var straightSorted = sortStandings(standings);

				for (var i = 0; i < rankedSorted.length; i++) {
					var rankedName = rankedSorted[i].name;
					var straightName = straightSorted[i].name;
					var rankedWinPct = (rankedSorted[i].wins * 100.0 / standings.completedGames).toFixed(2);
					var straightWinPct = (straightSorted[i].wins * 100.0 / standings.completedGames).toFixed(2);
					$("#ranked-body").append('<tr id="ranked' + i + '"></tr>');
					$("#straight-body").append('<tr id="straight' + i + '"></tr>');
					// player position
					$("#ranked" + i).append('<td style="text-align: left;">' + ordinalSuffixOf(i + 1) + '</td>');
					$("#straight" + i).append('<td style="text-align: left;">' + ordinalSuffixOf(i + 1) + '</td>');
					// player's name in the tables
					$("#ranked" + i).append('<td>' + rankedName + '</td>');
					$("#straight" + i).append('<td>' + straightName + '</td>');
					// player's score & player's wins
					$("#ranked" + i).append('<td>' + rankedSorted[i].points + '</td>');
					$("#straight" + i).append('<td>' + straightSorted[i].wins + '</td>');
					// player's win % in the tables
					$("#ranked" + i).append('<td>' + (isNaN(rankedWinPct) ? '0.00' : rankedWinPct) + '%</td>');
					$("#straight" + i).append('<td>' + (isNaN(straightWinPct) ? '0.00' : straightWinPct) + '%</td>');
				}
				// remove loading animation
				$(".remove-me").remove();
				// toggle hidden content
				$(".show-me").toggle();
			}
		});
	});
}

/**
 * Ordinal suffix rules are as follows:
 * st is used with numbers ending in 1 (e.g. 1st, pronounced first)
 * nd is used with numbers ending in 2 (e.g. 92nd, pronounced ninety-second)
 * rd is used with numbers ending in 3 (e.g. 33rd, pronounced thirty-third)
 * As an exception to the above rules, all the "teen" numbers ending with 11, 12 or 13 use -th (e.g. 11th, pronounced eleventh, 112th, pronounced one hundred [and] twelfth)
 * th is used for all other numbers (e.g. 9th, pronounced ninth).
 * @param i
 * @returns Returns the number i plus its correct ordinal suffix
 */
function ordinalSuffixOf(i) {
	var j = i % 10,
		k = i % 100;
	if (j === 1 && k !== 11) {
		return i + "st";
	}
	if (j === 2 && k !== 12) {
		return i + "nd";
	}
	if (j === 3 && k !== 13) {
		return i + "rd";
	}
	return i + "th";
}