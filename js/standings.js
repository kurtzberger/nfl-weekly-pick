/* global CUR_WEEK, season, firebase, UID */

// Get a reference to the database service
var database = firebase.database();

$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		wait();		// wait for global variables to be set
	});
});

/**
 * This function will wait for the global variable UID to be set before continuing to load the rest of the page.
 * When UID is set to a value, this indicates all other global variables have been set. 
 */
function wait()
{
	if(UID === null)
	{
		setTimeout( function() { wait(); }, 500 );
	} else
	{
		loadPage();
	}
}

/**
 * Load all page elements for this page
 */
function loadPage()
{
	var standings = {completedGames: 0};

	$("#standings-link").addClass("deep-orange lighten-3");
	$("#headerTitle").text("Standings");

	// get all users and create a standings object for that user.
	database.ref('users').once('value').then(function(snapshot)
	{
		var picks = snapshot.val();
		// get all display names from imported data and initialize standings object
		for(var i in picks)
		{
			standings[i] = 
			{
				name:				picks[i].displayName,
				points:				0,
				unassignedPoints:	0,
				wins:				0
			};
		}
		
		processStandings(parseInt(CUR_WEEK), standings, function()
		{
			var sorted = [];
			for(var i in standings)
			{
				if(i === 'completedGames')
				{
					continue;
				}
				sorted.push(standings[i]);
			}
			sorted.sort(function(a,b)
			{
				if(a.points !== b.points)
				{
					return b.points - a.points;
				} else
				{
					return b.wins - a.wins;
				}
			});

			for(var i=0; i<sorted.length; i++)
			{
				var name = sorted[i].name;
				var winPct = (sorted[i].wins * 100.0 / standings.completedGames).toFixed(2);
				$("#body").append('<tr id="' + i + '"></tr>');
				//player's position
				$("#" + i).append('<td style="text-align: left;">' + ordinalSuffixOf(i+1) + '</td>');
				//player's name in the table
				$("#" + i).append('<td>' + name + '</td>');
				//player's score
				$("#" + i).append('<td>' + sorted[i].points + '</td>');
				//player's win %
				$("#" + i).append('<td>' + (isNaN(winPct) ? '0.00' : winPct) + '%</td>');
			}

			// remove loading animation
			$(".remove-me").remove();
			// toggle hidden content
			$(".show-me").toggle();			
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
    if (j === 1 && k !== 11)
	{
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
};

function processStandings(n, standings, callback)
{
	//processLoop(1, week, games, standings);
	// get games of week (n) and then process those games with users' picks into standings
	//getGames(n, games, standings, function(uWeek, uGames, finals, uStandings)
	var url;
	if(n === parseInt(CUR_WEEK))
	{
		url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
	}
	else
	{
		url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + n;
	}
	
	$.get(url, function(xml)
	{
		// create weekly data object from XML file imported
		var weekData = new WeekGames(xml, function()
		{
			database.ref(season + '/picks/week' + weekData.week).once('value').then(function(snapshot)	// get all picks from database
			{
				var picks = snapshot.val();
				standings = calcStandings(picks, weekData, standings);
				standings.completedGames += weekData.completedGames;
				if(n > 1)
				{
					// recursively call this function again until base case (n greater than or equal to current week) is reached.
					processStandings(n-1, standings, callback);
				}
				else
				{
					callback();
				}
			});
		});
	});
}

function calcStandings(picks, weekData, standings)
{
	// enter possible unassigned points for this week, but if week is incomplete. Skip this.
	if(weekData.completedGames === weekData.games.length)
	{
		for(var i in standings)
		{
			if(i === 'completedGames')
			{
				continue;
			}
			standings[i].unassignedPoints = (weekData.completedGames * (weekData.completedGames + 1)) / 2;
		}
	}
	for(var i in picks)	// outer loop is games
	{
		for(var j in picks[i])	// inner loop is user picks
		{
			// if user's pick was correct credit them points and if they were wrong discredit them points
			if(weekData.games[picks[i][j].game].winner !== null)	// skip over if game is incomplete
			{
				if(picks[i][j].pick === weekData.games[picks[i][j].game].winner.abbrName)
				{
					standings[j].points += picks[i][j].points;
					standings[j].wins++;
				} else
				{
					standings[j].points -= picks[i][j].points;
				}
			}
			// since a pick was found here, mark these points as "assigned", skip this if week is incomplete
			if(weekData.completedGames === weekData.games.length)
			{
				standings[j].unassignedPoints -= picks[i][j].points;
			}
		}
	}
	// subtract any remaining unassigned points, but if week is incomplete. Skip this.
	if(weekData.completedGames === weekData.games.length)
	{
		for(var i in standings)
		{
			if(i === 'completedGames')
			{
				continue;
			}
			standings[i].points -= standings[i].unassignedPoints;
		}
	}
	return standings;
}