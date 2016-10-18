// Get a reference to the database service
var database = firebase.database();
// Global flag to specify when standings are done processing
var finished = false;
// Global finished games variable since this is being accessed in multiple funtions after callback
var completedGames = 0;

$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		var seasonType, week, localURL, games;
		var names = [], standings = {};
		// this URL is used just for this webpage
		localURL = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
		
		$("#standings-link").addClass("deep-orange lighten-3");
		$("#headerTitle").text("Standings");
		
		// get all users and create a standings object for that user.
		database.ref('users').once('value').then(function(snapshot)
		{
			var data = snapshot.val();
			// get all display names from imported data and initialize standings object
			for(var i in data)
			{
				names.push(data[i].displayName);
				standings[i] = {
					name:				data[i].displayName,
					points:				0,
					unassignedPoints:	0,
					wins:				0
				};
			}
			
			$.get(localURL, function( data )
			{
				seasonType = $(data).find('g')[0].getAttribute('gt');
				if(seasonType === "PRE")
				{
					week = 1;
				}
				else if(seasonType === "REG")
				{
					week = $(data).find('gms')[0].getAttribute('w');
				}
				else
				{
					week = 17;
				}
			
				processStandings(week, games, standings);
				var timerID = setInterval( function()
				{
					if(finished)
					{
						// place objects into array
						var Sorted = [];
						for(var i in standings)
						{
							Sorted.push(standings[i]);
						}
						// sort standings by points from highest points to lowest points. Win % is tie breaker
						Sorted.sort(function(a,b)
						{ 
							return (a.points < b.points)	?  1 : 
								  ((a.points > b.points) 	? -1 :
								  ((a.wins   < b.wins)		?  1 :
								  ((a.wins   > b.wins)		? -1 : 0))); 
						});
						
						for(var i=0; i<Sorted.length; i++)
						{
							var name = Sorted[i].name;
							var winPct = (Sorted[i].wins * 100.0 / completedGames).toFixed(2);
							$("#body").append('<tr id="' + i + '"></tr>');
							//player's position
							$("#" + i).append('<td style="text-align: left;">' + ordinalSuffixOf(i+1) + '</td>')
							//player's name in the table
							$("#" + i).append('<td>' + name + '</td>');
							//player's score
							$("#" + i).append('<td>' + Sorted[i].points + '</td>');
							//player's win %
							$("#" + i).append('<td>' + (isNaN(winPct) ? '0.00' : winPct) + '%</td>');
						}
						
						// remove loading animation
						$(".remove-me").remove();
						// toggle hidden content
						$(".show-me").toggle();
						
						clearInterval(timerID);
					}
				}, 1000);
			});
		});
	});
});

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

function processStandings(week, games, standings)
{
	var timeID = setInterval( function()
	{
		if(!isNaN(parseInt(CUR_WEEK)))	// wait until CUR_WEEK has been defined.
		{
			clearInterval(timeID);
			processLoop(1, week, games, standings);
		}
	}, 100);
};

function processLoop(n, week, games, standings)
{
	// get games of current week (n) and then process those games with users' picks into standings
	getGames(n, games, standings, function(uWeek, uGames, finals, uStandings)
	{
		database.ref(season + '/picks/week' + uWeek).once('value').then(function(snapshot)
		{
			var Picks = snapshot.val();
			standings = calcStandings(Picks, uGames, finals, uStandings);
			completedGames += finals;
			if(n < parseInt(week))
			{
				// recursively call this function again until base case (n greater than or equal to current week) is reached.
				processLoop(n+1, week, uGames, uStandings);
			}
			else
			{
				finished = true;
			}
			
		});
	});
};

function getGames(n, games, standings, callback)
{
	if(n === parseInt(CUR_WEEK))
	{
		localURL = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
	}
	else
	{
		localURL = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + n;
	}
	$.get(localURL, function( data )
	{
		var xmlDoc = $(data);
		var finals = xmlDoc.find('g[q="F"], g[q="FO"]').length;
		games = xmlDoc.find('g');
		// sort games via kickoffStartTime function
		kickoffStartTime(games);
		
		// callback function returning the modified standings
		callback(n, games, finals, standings);
	});
};

function calcStandings(Picks, games, finals, standings)
{
	// enter possible unassigned points for this week, but if week is incomplete. Skip this.
	if(finals === games.length)
	{
		for(var i in standings)
			standings[i].unassignedPoints = (finals * (finals + 1)) / 2;
	}
	
	var Winners = determineWinners(games);
	
	// outer loop is games
	for(var i in Picks)
	{
		// inner loop is user picks
		for(var j in Picks[i])
		{
			// if user's pick was correct credit them points and if they were wrong discredit them points
			if(Picks[i][j].pick === Winners[Picks[i][j].game])
			{
				standings[j].points += Picks[i][j].points;
				standings[j].wins++;
			} else if(Winners[Picks[i][j].game] !== "-")	// skip over if game is incomplete
				standings[j].points -= Picks[i][j].points;
			// since a pick was found here, mark these points as "assigned", skip this if week is incomplete
			if(finals === games.length)
				standings[j].unassignedPoints -= Picks[i][j].points;
		}
	}
	
	// subtract any remaining unassigned points, but if week is incomplete. Skip this.
	if(finals === games.length)
	{
		for(var i in standings)
			standings[i].points -= standings[i].unassignedPoints;
	}
	
	return standings;
};